import express from "express";
import authRoutes from "./routes/authRoute";
import chatsRoutes from "./routes/chatsRoute";
import usersRoutes from "./routes/userRoute";
import messagesRoutes from "./routes/messageRoute";

import { clerkMiddleware } from "@clerk/express";
//Middlewares
const app = express();
app.use(express.json());
app.use(clerkMiddleware());

app.get("/health", (req, res) => {
  res.json({ status: "success", message: "Server is up and running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/chats", chatsRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/messages", messagesRoutes);

export default app;
