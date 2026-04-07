export interface RoomParticipant {
  _id?: string;
  id?: string;
  name: string;
}

export interface RoomSummary {
  roomId: string;
  language: string;
  lastActive: string;
  participants: RoomParticipant[];
}
