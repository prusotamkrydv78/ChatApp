import express from "express";
import { protectRoute } from "../middlewares/auth"; 
import { getUsers } from "../controllers/userController";
const userRoutes = express.Router();

userRoutes.get("/", protectRoute, getUsers);

export default userRoutes;
