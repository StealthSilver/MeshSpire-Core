import { Room, Peer } from "../types";

class RoomManager {
  private rooms: Map<string, Room>;

  constructor() {
    this.rooms = new Map();
  }

  createRoom(roomId: string): Room {
    const room: Room = {
      id: roomId,
      peers: new Map(),
      createdAt: new Date(),
    };
    this.rooms.set(roomId, room);
    return room;
  }

  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  getRoomOrCreate(roomId: string): Room {
    let room = this.getRoom(roomId);
    if (!room) {
      room = this.createRoom(roomId);
    }
    return room;
  }

  addPeerToRoom(roomId: string, peer: Peer): void {
    const room = this.getRoomOrCreate(roomId);
    room.peers.set(peer.socketId, peer);
  }

  removePeerFromRoom(roomId: string, socketId: string): void {
    const room = this.getRoom(roomId);
    if (room) {
      room.peers.delete(socketId);
      // Clean up empty rooms
      if (room.peers.size === 0) {
        this.rooms.delete(roomId);
      }
    }
  }

  getPeersInRoom(roomId: string): Peer[] {
    const room = this.getRoom(roomId);
    return room ? Array.from(room.peers.values()) : [];
  }

  updatePeerMediaState(
    roomId: string,
    socketId: string,
    mediaState: Partial<Peer>
  ): void {
    const room = this.getRoom(roomId);
    if (room) {
      const peer = room.peers.get(socketId);
      if (peer) {
        Object.assign(peer, mediaState);
      }
    }
  }

  getAllRooms(): Room[] {
    return Array.from(this.rooms.values());
  }
}

export const roomManager = new RoomManager();
