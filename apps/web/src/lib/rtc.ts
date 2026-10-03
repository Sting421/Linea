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
