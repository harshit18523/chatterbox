import { Request, Response } from "express";
import { genSalt, hash, compare } from "bcrypt";
import { sign } from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler";
import User from "../models/userModel";

const register = asyncHandler(async (req: Request, res: Response) => {
  const { username, password } = req.body;
  const existingUser = await User.findOne({ username });
  if (existingUser) {
    return res.status(400).json({
      error: "username already taken"
    });
  }
  const salt = await genSalt(parseInt(process.env.BCRYPT_SALT as string));
  const passwordHash = await hash(password, salt);
  const newUser = new User({ username, passwordHash });
  await newUser.save();
  res.status(201).json({
    message: "user registered successfully"
  });
});

const login = asyncHandler(async (req: Request, res: Response) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(401).json({
      error: "invalid credentials"
    });
  }
  const isMatch = await compare(password, user.passwordHash);
  if (!isMatch) {
    return res.status(401).json({
      error: "invalid credentials"
    });
  }
  const token = sign({
    userId: user._id,
    username: user.username
  }, process.env.JWT_SECRET as string, {
    expiresIn: "24h"
  });
  res.status(200).json({
    token,
    username: user.username,
    userId: user._id
  });
});

export { register, login };
