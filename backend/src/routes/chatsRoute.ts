import express from "express";
import { protectRoute } from "../middlewares/auth";
import { getChats, createChat } from "../controllers/chatsConroller";
const chatsRoutes = express.Router();

chatsRoutes.get("/", protectRoute, getChats);
chatsRoutes.post("/with/:participantId", protectRoute, createChat);

export default chatsRoutes;
