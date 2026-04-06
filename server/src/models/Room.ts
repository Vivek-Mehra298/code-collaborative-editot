import mongoose, { Schema, Document } from 'mongoose';

export interface IRoom extends Document {
  roomId: string;
  createdBy: mongoose.Types.ObjectId;
  language: string;
  code: string;
  participants: mongoose.Types.ObjectId[];
  lastActive: Date;
  createdAt: Date;
}

const RoomSchema: Schema = new Schema({
  roomId: { type: String, required: true, unique: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  language: { type: String, default: 'javascript' },
  code: { type: String, default: '' },
  participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  lastActive: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IRoom>('Room', RoomSchema);
