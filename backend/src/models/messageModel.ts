import { Document, Types, Schema, model } from "mongoose";

export interface IMessage extends Document {
  sender: Types.ObjectId;
  chatType: "direct" | "room";
  room?: Types.ObjectId;
  recipient?: Types.ObjectId;
  content: string;
  createdAt: Date;
}

const MessageSchema: Schema = new Schema({
  sender: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  chatType: {
    type: String,
    enum: ["direct", "room"],
    required: true
  },
  room: {
    type: Schema.Types.ObjectId,
    ref: "Room"
  },
  recipient: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  content: {
    type: String,
    required: true
  }
}, { timestamps: true });

MessageSchema.index({
  room: 1,
  createdAt: -1
});

MessageSchema.index({
  sender: 1,
  recipient: 1,
  createdAt: -1
});

export default model<IMessage>("Message", MessageSchema);
