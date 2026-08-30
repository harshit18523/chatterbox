import { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";

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
    const decoded = verify(token, process.env.JWT_SECRET as string) as {
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
