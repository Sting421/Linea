"""Agora REST and RTC adapter. Policy and ownership are enforced by RuntimeService."""

import copy
import hashlib
import hmac
import json
import os
import re
from datetime import timedelta
from pathlib import Path
from urllib.parse import quote

import httpx
from agora_token_builder.AccessToken import AccessToken, kJoinChannel, kPublishAudioStream

from .conversation import opening
from .models import now


class AgoraRuntime:
    def __init__(self, client=None, properties=None):
        self.app_id = os.environ["AGORA_APP_ID"]
        self.certificate = os.environ["AGORA_APP_CERTIFICATE"]
        self.from_number = os.environ["AGORA_FROM_NUMBER"]
        self.callback_origin = os.environ["LINEA_PUBLIC_API_URL"].rstrip("/")
        self.bearer = os.environ["LINEA_CUSTOM_LLM_BEARER"]
        self.properties = (
            properties
            if properties is not None
            else json.loads(
                Path(os.environ["LINEA_AGORA_PROPERTIES_FILE"]).read_text(encoding="utf-8")
            )
        )
        if not self.callback_origin.startswith("https://"):
            raise RuntimeError("Agora requires a public HTTPS completion URL")
        if not re.fullmatch(r"\+[1-9]\d{7,14}", self.from_number):
            raise RuntimeError("AGORA_FROM_NUMBER must be an owned E.164 SIP number")
        if not self.properties.get("asr") or not self.properties.get("tts"):
            raise RuntimeError("Supply verified English ASR/TTS properties from Agora Console")
        self.client = client or httpx.Client(
            base_url="https://api.agora.io",
            timeout=15,
            auth=(os.environ["AGORA_CUSTOMER_ID"], os.environ["AGORA_CUSTOMER_SECRET"]),
        )
        self.base = f"/api/conversational-ai-agent/v2/projects/{self.app_id}"

    def token(self, channel, uid, ttl=900):
        expires = now() + timedelta(seconds=ttl)
        token = AccessToken(self.app_id, self.certificate, channel, uid)
        token.addPrivilege(kJoinChannel, int(expires.timestamp()))
        token.addPrivilege(kPublishAudioStream, int(expires.timestamp()))
        return token.build(), expires

    def place(self, call, profile):
        leg = call.legs[-1]
        properties = copy.deepcopy(self.properties)
        token, _ = self.token(leg.channel, 2001, 3600)
        sip_token, _ = self.token(leg.channel, 2000, 3600)
        # A complete configuration avoids depending on undocumented pipeline overrides.
        properties.update(
            channel=leg.channel,
            token=token,
            agent_rtc_uid="2001",
            remote_rtc_uids=["2000"],
            enable_string_uid=False,
        )
        properties.setdefault("asr", {})["language"] = "en-US"
        properties["llm"] = {
            "vendor": "custom",
            "style": "openai",
            "api_key": self.bearer,
            "url": f"{self.callback_origin}/provider/checkins/{call.id}/legs/{leg.id}/chat/completions",
            "greeting_message": opening(call, profile, leg.kind == "reconnect"),
            "failure_message": "",
            "max_history": 16,
        }
        properties.setdefault("parameters", {})["opt_out"] = True
        response = self.client.post(
            f"{self.base}/call",
            json={
                "name": f"linea-{leg.id}",
                "properties": properties,
                "sip": {
                    "to_number": profile.phone,
                    "from_number": self.from_number,
                    "rtc_uid": "2000",
                    "rtc_token": sip_token,
                },
            },
        )
        response.raise_for_status()
        agent = response.json().get("agent_id")
        if not isinstance(agent, str) or not agent:
            raise ValueError("Agora did not return a session identity")
        return agent

    def speak(self, call, text):
        agent = call.legs[-1].provider_agent_id
        # Respect the documented 512-byte limit without splitting UTF-8 codepoints.
        pieces, current = [], ""
        for word in text.split():
            candidate = f"{current} {word}".strip()
            if len(candidate.encode()) > 512:
                if not current:
                    raise ValueError("A speech word exceeds the provider limit")
                pieces.append(current)
                current = word
            else:
                current = candidate
        if current:
            pieces.append(current)
        for index, piece in enumerate(pieces):
            self.client.post(
                f"{self.base}/agents/{quote(agent, safe='')}/speak",
                json={
                    "text": piece,
                    "priority": "INTERRUPT" if index == 0 else "APPEND",
                    "interruptable": not call.emergency_latched,
                },
            ).raise_for_status()

    def end_everyone(self, call):
        agent = quote(call.legs[-1].provider_agent_id, safe="")
        for path in (f"calls/{agent}/hangup", f"agents/{agent}/leave"):
            response = self.client.post(f"{self.base}/{path}")
            if response.status_code != 404:
                response.raise_for_status()

    def call_status(self, call):
        agent = quote(call.legs[-1].provider_agent_id, safe="")
        response = self.client.get(f"{self.base}/calls/{agent}")
        response.raise_for_status()
        return response.json()

    def find_agent(self, leg):
        response = self.client.get(
            f"{self.base}/agents",
            params={
                "channel": leg.channel,
                "state": "0,1,2,3,4,6",
                "limit": 2,
                "from_time": int(leg.started_at.timestamp()) - 60,
            },
        )
        response.raise_for_status()
        matches = response.json()["data"]["list"]
        if len(matches) != 1:
            return None
        return matches[0]["agent_id"]

    def family_token(self, call, member):
        uid = call.rtc_members[member]
        token, expires = self.token(call.legs[-1].channel, uid)
        return {
            "appId": self.app_id,
            "channel": call.legs[-1].channel,
            "uid": uid,
            "token": token,
            "expiresAt": expires.isoformat(),
        }

    def members(self, call):
        channel = quote(call.legs[-1].channel, safe="")
        response = self.client.get(
            f"https://api.sd-rtn.com/dev/v1/channel/user/{self.app_id}/{channel}"
        )
        response.raise_for_status()
        body = response.json()
        if not body.get("success"):
            raise ValueError("Provider membership lookup failed")
        data = body["data"]
        return {
            int(uid)
            for uid in data.get("users", [])
            + data.get("broadcasters", [])
            + data.get("audience", [])
        }


def verify_signature(raw, headers, secret):
    if not secret:
        return False
    signature = headers.get("Agora-Signature-V2")
    algorithm = hashlib.sha256
    if signature is None:
        signature, algorithm = headers.get("Agora-Signature"), hashlib.sha1
    return bool(signature) and hmac.compare_digest(
        hmac.new(secret.encode(), raw, algorithm).hexdigest(),
        signature,
    )
