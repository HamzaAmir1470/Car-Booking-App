import express from "express";
import {
  LoginUser,
  signupNewUser,
  verifyOtp,
  sendOtpToEmail,
} from "../controllers/user.controller";

const userRouter = express.Router();

userRouter.post("/registration", LoginUser);
userRouter.post("/verify-otp", verifyOtp);
userRouter.put("/sign-up-user", signupNewUser);
userRouter.post("/email-otp-request", sendOtpToEmail);

export default userRouter;
