import type { Response } from "express";
import { randomBytes } from "crypto";
import type { AuthRequest } from "../middlewares/authMiddleware.js";
import Room from "../models/roomModel.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createRoom = asyncHandler(async (req: AuthRequest, res: Response) => {
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
