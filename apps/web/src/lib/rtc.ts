/** The family browser owns only its own RTC connection. The backend remains
 * responsible for policy, token authorization, and ending all call resources.
 * Token issuance is not evidence that this participant joined the phone leg.
 */
export type RTCCredentials = {
  appId: string;
  channel: string;
  token: string;
  uid: number;
  expiresAt: string;
};
export interface FamilyRTC {
  join(credentials: RTCCredentials): Promise<void>;
  setMuted(muted: boolean): Promise<void>;
  leave(): Promise<void>;
  onConnectionChange(
    callback: (state: 'connected' | 'reconnecting' | 'disconnected') => void,
  ): () => void;
}
export class UnconnectedFamilyRTC implements FamilyRTC {
  async join() {
    throw new Error('Agora browser audio is not connected. Demo calls do not use the microphone.');
  }
  async setMuted() {
    throw new Error('No live microphone track is connected.');
  }
  async leave() {}
  onConnectionChange() {
    return () => {};
  }
}

export class AgoraFamilyRTC implements FamilyRTC {
  private client: import('agora-rtc-sdk-ng').IAgoraRTCClient | null = null;
  private microphone: import('agora-rtc-sdk-ng').IMicrophoneAudioTrack | null = null;
  private callbacks = new Set<(state: 'connected' | 'reconnecting' | 'disconnected') => void>();
  private generation = 0;
  private renew: (() => Promise<RTCCredentials>) | null = null;
  constructor(private loadSDK = () => import('agora-rtc-sdk-ng')) {}

  onTokenExpiring(callback: () => Promise<RTCCredentials>) {
    this.renew = callback;
  }

  async join(credentials: RTCCredentials) {
    const leaving = this.leave();
    const generation = this.generation;
    await leaving;
    if (generation !== this.generation) throw new Error('Audio join was cancelled.');
    const { default: AgoraRTC } = await this.loadSDK();
    if (generation !== this.generation) throw new Error('Audio join was cancelled.');
    const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    this.client = client;
    client.on('user-published', async (user, mediaType) => {
      if (mediaType !== 'audio' || generation !== this.generation) return;
      try {
        await client.subscribe(user, 'audio');
        if (generation === this.generation) user.audioTrack?.play();
      } catch {
        if (generation === this.generation) this.callbacks.forEach((cb) => cb('disconnected'));
      }
    });
    client.on('connection-state-change', (state) => {
      if (generation !== this.generation) return;
      const mapped =
        state === 'CONNECTED'
          ? 'connected'
          : state === 'RECONNECTING'
            ? 'reconnecting'
            : 'disconnected';
      this.callbacks.forEach((cb) => cb(mapped));
    });
    client.on('token-privilege-did-expire', () => {
      if (generation === this.generation) void this.leave().catch(() => {});
    });
    client.on('token-privilege-will-expire', async () => {
      if (generation !== this.generation) return;
      try {
        if (!this.renew) throw new Error('Token renewal is unavailable.');
        const fresh = await this.renew();
        if (generation !== this.generation) return;
        if (
          fresh.channel !== credentials.channel ||
          fresh.uid !== credentials.uid ||
          fresh.appId !== credentials.appId
        )
          throw new Error('The call has changed.');
        await client.renewToken(fresh.token);
      } catch {
        if (generation === this.generation) await this.leave();
      }
    });
    try {
      const microphone = await AgoraRTC.createMicrophoneAudioTrack();
      if (generation !== this.generation) {
        microphone.close();
        throw new Error('Audio join was cancelled.');
      }
      this.microphone = microphone;
      await client.join(credentials.appId, credentials.channel, credentials.token, credentials.uid);
      if (generation !== this.generation) throw new Error('Audio join was cancelled.');
      await client.publish(this.microphone);
      if (generation !== this.generation) throw new Error('Audio join was cancelled.');
    } catch (error) {
      if (generation === this.generation) await this.leave();
      else {
        await client.leave();
        client.removeAllListeners();
      }
      throw error;
    }
  }

  async setMuted(muted: boolean) {
    if (!this.microphone) throw new Error('No live microphone track is connected.');
    await this.microphone.setMuted(muted);
  }

  async leave() {
    const generation = ++this.generation;
    const client = this.client;
    this.client = null;
    this.microphone?.stop();
    this.microphone?.close();
    this.microphone = null;
    try {
      if (client) {
        await client.leave();
      }
    } finally {
      client?.removeAllListeners();
      if (generation === this.generation) this.callbacks.forEach((cb) => cb('disconnected'));
    }
  }

  onConnectionChange(callback: (state: 'connected' | 'reconnecting' | 'disconnected') => void) {
    this.callbacks.add(callback);
    return () => {
      this.callbacks.delete(callback);
    };
  }
}
