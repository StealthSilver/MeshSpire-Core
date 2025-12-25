export interface Peer {
  id: string;
  socketId: string;
  userName: string;
  isAudioMuted: boolean;
  isVideoMuted: boolean;
}

export interface MediaState {
  isAudioMuted: boolean;
  isVideoMuted: boolean;
}
