export class PolyboardMessage {
  user_id: string;
  room_id: string;
  subsystem: string;
  type: string;
  payload: any[];

  constructor(userId: string, roomId: string, type: string, subSystem: string, payload: any[]) {
    this.user_id = userId;
    this.room_id = roomId;
    this.type = type;
    this.subsystem = subSystem;
    this.payload = payload;
  }
}