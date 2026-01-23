import express from "express";
import { protectRoute } from "../middlewares/auth";
import { authCallback, getMe } from "../controllers/authController";
const authRoutes = express.Router();

authRoutes.get("/me", protectRoute, getMe);
authRoutes.get("/callback", authCallback);

export default authRoutes;
