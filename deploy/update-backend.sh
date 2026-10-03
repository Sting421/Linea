#!/usr/bin/env bash
# Run from the server's Linea Git checkout as root. No migrations or calls.
set -Eeuo pipefail
umask 022
[[ $EUID == 0 ]] || { echo 'Run with sudo.'; exit 1; }
ref=${1:?Usage: bash deploy/update-backend.sh COMMIT [--enable-push]}
push=${2:-}
[[ -z "$push" || "$push" == --enable-push ]] || exit 1
commit=$(git rev-parse --verify "$ref^{commit}")
previous=$(readlink -f /opt/linea/current)
release="/opt/linea/releases/$commit"
staging=$(mktemp -d /opt/linea/releases/.deploy-XXXXXX)
git archive "$commit" | tar -x -C "$staging"
chmod 755 "$staging"
if [[ -e "$release" ]]; then
  diff -qr --exclude=__pycache__ --exclude=.pytest_cache "$staging" "$release"
else
  mv "$staging" "$release"
fi
# This updater deliberately refuses dependency changes in the shared venv.
cmp "$previous/services/api/requirements.lock.txt" "$release/services/api/requirements.lock.txt"
/opt/linea/venv/bin/python -m compileall -q "$release/services/api/app"
/opt/linea/venv/bin/python - "$release" "$push" <<'PY'
import os, sys
from dotenv import load_dotenv
load_dotenv('/etc/linea/backend.env')
sys.path.insert(0, sys.argv[1] + '/services/api')
from app.retrieval import CuratedRetriever
CuratedRetriever(os.environ['OPENAI_API_KEY'])  # Local corpus/index validation only.
if sys.argv[2] == '--enable-push':
    from py_vapid import Vapid
    from cryptography.hazmat.primitives import serialization
    import base64
    required = ('WEB_PUSH_PUBLIC_KEY', 'WEB_PUSH_PRIVATE_KEY', 'WEB_PUSH_SUBJECT')
    if any(not os.getenv(k) for k in required):
        raise SystemExit('Install all three WEB_PUSH settings before enabling push.')
    vapid = Vapid.from_string(os.environ['WEB_PUSH_PRIVATE_KEY'])
    raw = vapid.public_key.public_bytes(serialization.Encoding.X962, serialization.PublicFormat.UncompressedPoint)
    expected = base64.urlsafe_b64encode(raw).decode().rstrip('=')
    if expected != os.environ['WEB_PUSH_PUBLIC_KEY'].rstrip('='):
        raise SystemExit('Web push key pair does not match.')
PY
# Audit before stopping a healthy service; pending work must be inspected first.
/opt/linea/venv/bin/python "$release/scripts/preflight-calling.py" \
  --env-file /etc/linea/backend.env --check-provider

voice_active=0; notifications_active=0
systemctl is-active --quiet linea-voice && voice_active=1
systemctl is-active --quiet linea-notifications && notifications_active=1
backup="/etc/linea/backend.env.backup-$(date +%Y%m%d%H%M%S)"
cp -a /etc/linea/backend.env "$backup"
rollback() {
  trap - ERR
  echo 'Deployment failed; restoring previous application and environment.'
  systemctl stop linea-notifications linea-voice linea-api || true
  cp -a "$backup" /etc/linea/backend.env
  ln -sfnT "$previous" /opt/linea/current
  systemctl start linea-api || true
  [[ $voice_active == 0 ]] || systemctl start linea-voice || true
  [[ $notifications_active == 0 ]] || systemctl start linea-notifications || true
  exit 1
}
trap rollback ERR
systemctl stop linea-voice linea-api
if [[ $notifications_active == 1 ]]; then systemctl stop linea-notifications; fi
/opt/linea/venv/bin/python - "$commit" "$push" <<'PY'
import pathlib, re, sys
p = pathlib.Path('/etc/linea/backend.env')
text = p.read_text()
updates = {'LINEA_BUILD_ID': sys.argv[1]}
if sys.argv[2] == '--enable-push': updates['LINEA_PUSH_ENABLED'] = '1'
for key, value in updates.items():
    pattern = rf'(?m)^(?:export\s+)?{key}=.*$'
    line = f'{key}={value}'
    text = re.sub(pattern, line, text) if re.search(pattern, text) else text.rstrip() + '\n' + line + '\n'
p.write_text(text)
PY
ln -sfnT "$release" /opt/linea/current
install -m 644 "$release/deploy/systemd/linea-notifications.service" /etc/systemd/system/
install -m 644 "$release/deploy/systemd/linea-retention.service" /etc/systemd/system/
install -m 644 "$release/deploy/systemd/linea-retention.timer" /etc/systemd/system/
install -m 644 "$release/scripts/preflight-calling.py" /opt/linea/ops/preflight-calling.py
systemctl daemon-reload
systemctl start linea-api
if [[ $voice_active == 1 ]]; then systemctl start linea-voice; fi
if [[ $notifications_active == 1 || "$push" == --enable-push ]]; then
  systemctl start linea-notifications
fi
sleep 5
systemctl is-active --quiet linea-api
if [[ $voice_active == 1 ]]; then systemctl is-active --quiet linea-voice; fi
if [[ $notifications_active == 1 || "$push" == --enable-push ]]; then
  systemctl is-active --quiet linea-notifications
fi
curl --fail --silent --show-error --max-time 10 http://127.0.0.1:8000/health
echo
trap - ERR
systemctl enable --now linea-retention.timer
echo "Deployed: $release"
echo 'Phone audio, device push receipt, and callbacks still require real verification.'
