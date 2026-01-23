import type { NextFunction, Request, Response } from "express";
import type { AuthRequest } from "../middlewares/auth";
import User from "../models/User";
import { clerkClient, getAuth } from "@clerk/express";

export const getMe = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId } = req;
    if (!userId) {
      return res.status(401).json({ status: "error", message: "Unauthorized" });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });
    }
    return res.status(200).json({ status: "success", data: user });
  } catch (error) {
    return next(error);
  }
};

export const authCallback = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId: clerkId } = getAuth(req);
    if (!clerkId) {
      return res.status(401).json({ status: "error", message: "Unauthorized" });
    }
    const user = await User.findOne({ clerkId });
    if (!user) {
      const clerkUser = await clerkClient.users.getUser(clerkId);
      if (!clerkUser) {
        return res
          .status(404)
          .json({ status: "error", message: "User not found" });
      }
      const { id: userId, firstName, lastName, emailAddresses } = clerkUser;
      const user = new User({
        clerkId: userId,
        name: `${firstName} ${lastName}`,
        email: emailAddresses[0]?.emailAddress,
        avatar: clerkUser.imageUrl,
      });
      await user.save();
    }
    return res.status(200).json({ status: "success", data: user });
  } catch (error) {
    return next(error);
  }
};
