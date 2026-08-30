import type { Response } from "express";
import { randomBytes } from "crypto";
import type { AuthRequest } from "../middlewares/authMiddleware.js";
import Room from "../models/roomModel.js";
import Message from "../models/messageModel.js";
import asyncHandler from "../utils/asyncHandler.js";

const createRoom = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, isPrivate } = req.body;
  const userId = req.user?.userId;
  const existingRoom = await Room.findOne({ name });
  if (existingRoom) {
    return res.status(400).json({
      error: "room name already exists"
    });
  }
  let joinCode = undefined;
  if (isPrivate) {
    joinCode = randomBytes(4).toString("hex").toUpperCase();
  }
  const newRoom = new Room({
    name,
    isPrivate,
    creator: userId,
    joinCode,
    members: [userId]
  });
  await newRoom.save();
  res.status(201).json({
    message: "room created successfully",
    room: {
      id: newRoom._id,
      name: newRoom.name,
      isPrivate: newRoom.isPrivate,
      joinCode: newRoom.joinCode
    }
  });
});

const getRoomMessages = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { roomId } = req.params;
  const messages = await Message.find({
    room: roomId!,
    chatType: "room"
  }).sort({ createdAt: 1 }).populate("sender", "username").limit(100);
  res.status(200).json(messages);
});

export { createRoom, getRoomMessages };
