import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { Server as HttpServer} from "http";
import registerEventHandlers from "./handler.js";

export interface AuthSocket extends Socket {
  user?: {
    userId: string;
    username: string;
  }
}

export default function initializeSocket(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "*"
    }
  });
  io.use((socket: AuthSocket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("authentication error: token missing"));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
        userId: string;
        username: string;
      };
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error("authentication error: invalid token"));
    }
  });
  io.on("connection", (socket: AuthSocket) => {
    console.log(`User connected: ${socket.user?.username} (${socket.id})`);

    socket.join(socket.user!.userId);
    registerEventHandlers(io, socket);

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.user?.username}`);
    });
  });
  return io;
}
