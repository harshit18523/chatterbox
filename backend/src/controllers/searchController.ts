import type { Response } from "express";
import type { AuthRequest } from "../middlewares/authMiddleware.js";
import User from "../models/userModel.js"
import Room from "../models/roomModel.js"
import asyncHandler from "../utils/asyncHandler.js";

const searchUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { q } = req.query;
  if (!q || typeof q !== "string") {
    return res.status(400).json({
      error: "search query is required"
    });
  }
  const users = await User.find({
    username: {
      $regex: q,
      $options: "i"
    }
  }).select("username _id");
  res.status(200).json(users);
});

const searchRooms = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { q } = req.query;
  if (!q || typeof q !== "string") {
    return res.status(400).json({
      error: "search query is required"
    });
  }
  const rooms = await Room.find({
    name: {
      $regex: q,
      $options: "i"
    }
  }).select("name isPrivate _id creator");
  res.status(200).json(rooms);
});

export { searchUsers, searchRooms };
