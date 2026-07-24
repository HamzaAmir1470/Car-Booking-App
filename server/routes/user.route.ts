import express from "express";
import {
  LoginUser,
  verifyOtp,
  sendOtpToEmail,
  verifyEmailOtp,
  getLoggedInUserData,
  getAllRides,
} from "../controllers/user.controller";
import { isAuthenticated } from "../middleware/isAuthenticated";

const userRouter = express.Router();

userRouter.post("/registration", LoginUser);

userRouter.post("/verify-otp", verifyOtp);

userRouter.post("/email-otp-request", sendOtpToEmail);

userRouter.put("/email-otp-verify", verifyEmailOtp);

userRouter.get("/me", isAuthenticated, getLoggedInUserData);

userRouter.get("/get-rides", isAuthenticated, getAllRides);

export default userRouter;
