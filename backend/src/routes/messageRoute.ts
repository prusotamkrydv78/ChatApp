import express from "express";
import { protectRoute } from "../middlewares/auth";
import { getMessages } from "../controllers/messageController";
const messageRoutes = express.Router();

messageRoutes.get("/chat/:chatId", protectRoute, getMessages);

export default messageRoutes;
