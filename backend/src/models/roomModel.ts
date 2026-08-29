import { Document, Types, Schema, model } from "mongoose";

export interface IRoom extends Document {
  name: string;
  isPrivate: boolean;
  creator: Types.ObjectId;
  joinCode?: string;
  members: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const RoomSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  joinCode: {
    type: String,
    required: function(this: IRoom) { return this.isPrivate; }
  },
  members: [{
    type: Schema.Types.ObjectId,
    ref: "User"
  }]
}, { timestamps: true });

export default model<IRoom>("Room", RoomSchema);
