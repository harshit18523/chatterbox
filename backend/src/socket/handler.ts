import type { Server } from "socket.io";
import type { AuthSocket } from "./index.js";
import Message from "../models/messageModel.js";
import Room from "../models/roomModel.js";

export default function registerEventHandlers(io: Server, socket: AuthSocket) {
  const userId = socket.user?.userId;
  socket.on("join_room", async (roomId: string) => {
    socket.join(roomId);
    socket.emit("joined_room", roomId);
  });
  socket.on("send_message", async (data: {
    roomId: string;
    recipientId: string;
    content: string;
  }) => {
    try {
      const chatType = data.roomId ? "room" : "direct";
      const newMessage = new Message({
        sender: userId,
        chatType,
        room: data.roomId,
        recipient: data.recipientId,
        content: data.content
      });
      await newMessage.save();
      const populatedMessage = await newMessage.populate("sender", "username");
      if (chatType === "room") {
        io.to(data.roomId).emit("receive_message", populatedMessage);
      } else {
        io.to(data.recipientId).emit("receive_message", populatedMessage);
        socket.emit("receive_message", populatedMessage);
      }
    } catch (error) {
      socket.emit("error", "message failed to send");
    }
  });
  socket.on("kick_user", async (data: {
    roomId: string;
    targetUserId: string;
  }) => {
    try {
      const room = await Room.findById(data.roomId);
      if (!room) {
        return socket.emit("error", "room not found");
      } else if (room.creator.toString() !== userId) {
        return socket.emit("error", "only the creator can remove members");
      }
      room.members = room.members.filter(id => id.toString() !== data.targetUserId);
      await room.save();
      io.to(data.roomId).emit("user_kicked", {
        userId: data.targetUserId,
        roomId: data.roomId
      });
      const targetSockets = await io.in(data.targetUserId).fetchSockets();
      targetSockets.forEach(s => s.leave(data.roomId));
    } catch (error) {
      socket.emit("error", "failed to remove user");
    }
  });
}
