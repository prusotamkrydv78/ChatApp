import { type Request, type Response, type NextFunction } from "express";
import User from "../models/User";
import type { AuthRequest } from "../middlewares/auth";
export const getUsers = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ status: "error", message: "Unauthorized" });
    }
    const users = await User.find({ _id: { $ne: userId } })
      .select("name email avatar")
      .limit(10);
    return res.status(200).json({ status: "success", data: users });
  } catch (error) {
    return next(error);
  }
};
