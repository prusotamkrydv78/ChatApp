import { Server as socketServer } from "socket.io";
import { Server as httpServer } from "http";
import { verifyToken } from "@clerk/express";
import User from "../models/User";
import Chats from "../models/Chats";
import Message from "../models/Message";

interface SocketWithUser extends socketServer {
  userId: string;
}
export const onlineUsers: Map<string, string> = new Map();
export const initilizeSocket = (httpServer: httpServer) => {
  const io = new socketServer(httpServer, {
    cors: {
      origin: "*",
    },
  });

  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error"));
    }
    try {
      const session = await verifyToken(token as string, {
        secretKey: process.env.SECRET_KEY,
      });
      const clerkId = session.userId;
      const user = await User.findOne({ clerkId: clerkId! });
      if (!user) {
        return next(new Error("User not found"));
      }
      socket.data.user = user;
      socket.data.userId = user._id.toString();
      return next();
    } catch (error) {
      return next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.data.userId;

    socket.emit("online-users", {
      users: Array.from(onlineUsers.keys()),
    });
    onlineUsers.set(userId, socket.id);
    socket.broadcast.emit("user-online", {
      userId,
      socketId: socket.id,
    });
    socket.join(`userId:${userId}`);

    socket.on("join-chat", (chatId: string) => {
      socket.join(`chat:${chatId}`);
    });

    socket.on("leave-chat", (chatId: string) => {
      socket.leave(`chat:${chatId}`);
    });

    socket.on(
      "send-message",
      async (data: { chatId: string; text: string }) => {
        const { chatId, text } = data;
        const chat = await Chats.findOne({ _id: chatId, participants: userId });
        if (!chat) {
          return socket.emit("error", {
            message: "Chat not found",
          });
        }
        const message = await Message.create({
          chatId,
          senderId: userId!,
          text,
        });
        chat.lastMessage = message._id;
        chat.updatedAt = new Date();
        chat.lastMessageAt = new Date();
        await chat.save();
        await message.populate("sender", "name email avatar");
        // socket.broadcast.emit("new-message", {
        //   chatId,
        //   message,
        //   userId,
        // });

        io.to(`chat:${chatId}`).emit("new-message", message);

        for (const participant of chat.participants) {
          if (participant.toString() !== userId) {
            io.to(`user:${participant}`).emit("new-message", message);
          }
        }
      },
    );

    socket.on("disconnect", () => {
      onlineUsers.delete(userId);
      socket.broadcast.emit("user-offline", {
        userId,
        socketId: socket.id,
      });
    });
  });

  return io;
};
