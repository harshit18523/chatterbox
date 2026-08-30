import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    username: string;
  };
}

export default function verifyToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "access denied\nno token provided"
    });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token as string, process.env.JWT_SECRET as string) as {
      userId: string;
      username: string;
    };
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({
      error: "invalid or expired token"
    });
  }
}
