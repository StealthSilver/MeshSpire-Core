export interface Peer {
  id: string;
  socketId: string;
  userName: string;
  isAudioMuted: boolean;
  isVideoMuted: boolean;
}

export interface Room {
  id: string;
  peers: Map<string, Peer>;
  createdAt: Date;
}

export interface SignalData {
  type: "offer" | "answer" | "ice-candidate";
  data: any;
  from: string;
  to: string;
}

export interface JoinRoomData {
  roomId: string;
  userName: string;
}

export interface MediaState {
  isAudioMuted: boolean;
  isVideoMuted: boolean;
}
