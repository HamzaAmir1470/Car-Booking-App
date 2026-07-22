import express from "express";
import {
  LoginUser,
  verifyOtp,
  sendOtpToEmail,
  verifyEmailOtp,
} from "../controllers/user.controller";

const userRouter = express.Router();

userRouter.post("/registration", LoginUser);

userRouter.post("/verify-otp", verifyOtp);

userRouter.post("/email-otp-request", sendOtpToEmail);

userRouter.put("/email-otp-verify", verifyEmailOtp);

export default userRouter;
