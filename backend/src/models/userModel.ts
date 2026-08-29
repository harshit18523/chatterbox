import { Document, Schema, model } from "mongoose";

export interface IUser extends Document {
  username: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  passwordHash: {
    type: String,
    required: true
  }
}, { timestamps: true });

export default model<IUser>("User", UserSchema);
