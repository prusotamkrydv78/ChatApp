import type { Request, Response, NextFunction } from "express";
import type { AuthRequest } from "../middlewares/auth";
import Chats from "../models/Chats";

export async function getChats(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ status: "error", message: "Unauthorized" });
    }
    const chats = await Chats.find({ participants: userId })
      .populate("participants", "name email avatar")
      .sort({ lastMessageAt: -1 });

    const formatedChats = chats.map((chat) => {
      const otherParticipant = chat.participants.find(
        (participant) => participant._id.toString() !== userId,
      );
      return {
        _id: chat._id,
        participants: otherParticipant,
        lastMessageAt: chat.lastMessageAt,
        lastMessage: chat.lastMessage,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
      };
    });
    return res.status(200).json({ status: "success", data: formatedChats });
  } catch (error) {
    next(error);
  }
}

export async function createChat(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ status: "error", message: "Unauthorized" });
    }
    const { participantId } = req.params;
    if (!participantId) {
      return res
        .status(400)
        .json({ status: "error", message: "Participant ID is required" });
    }
    let chat = await Chats.findOne({
      participants: { $all: [userId, participantId] },
    })
      .populate("participants", "name email avatar")
      .populate("lastMessage");

    if (chat) {
      return res.status(200).json({ status: "success", data: chat });
    }
    if (!chat) {
      const newChat = new Chats({
        participants: [userId, participantId],
      });
      await newChat.save();
      chat = await Chats.findById(newChat._id)
        .populate("participants", "name email avatar")
        .populate("lastMessage");
    }
    const otherParticipant = chat!.participants.find(
      (participant) => participant._id.toString() !== userId,
    );
    return res.status(201).json({
      status: "success",
      data: {
        _id: chat!._id,
        participants: otherParticipant,
        lastMessageAt: chat!.lastMessageAt,
        lastMessage: chat!.lastMessage,
        createdAt: chat!.createdAt,
        updatedAt: chat!.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
}
