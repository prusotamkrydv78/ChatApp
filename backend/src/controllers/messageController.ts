import type { Request, Response, NextFunction } from "express";
import Message from "../models/Message";
import type { AuthRequest } from "../middlewares/auth";
import Chats from "../models/Chats";

export async function getMessages(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const chatId = req.params.chatId;
    const userId = req.userId;
    if (!chatId) {
      return res
        .status(400)
        .json({ status: "error", message: "Chat ID is required" });
    }
    if (!userId) {
      return res.status(401).json({ status: "error", message: "Unauthorized" });
    }
    const chat = await Chats.findOne({ _id: chatId, participants: userId });
    if (!chat) {
      return res
        .status(404)
        .json({ status: "error", message: "Chat not found" });
    }
    const messages = await Message.find({ chat: chatId })
      .sort({ createdAt: 1 })
      .populate("sender", "name email avatar");
    if (!messages) {
      return res
        .status(404)
        .json({ status: "error", message: "Messages not found" });
    }
    return res.status(200).json({ status: "success", data: messages });
  } catch (error) {
    next(error);
  }
}
