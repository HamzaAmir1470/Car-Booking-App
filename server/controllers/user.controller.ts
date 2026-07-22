require("dotenv").config();
import { Request, Response, NextFunction } from "express";
import Twilio from "twilio";
import prisma from "../utils/prisma";
import jwt from "jsonwebtoken";
import { nylas } from "../app";
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
if (!accountSid || !authToken) {
  throw new Error(
    "Missing Twilio Account SID or Auth Token in environment variables.",
  );
}
const client = Twilio(accountSid, authToken, {
  lazyLoading: true,
});

export const LoginUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { phone_number } = req.body;
    const serviceSid = process.env.TWILIO_SERVICE_SID;
    if (!serviceSid) {
      throw new Error("Missing TWILIO_SERVICE_SID in environment variables.");
    }
    try {
      await client.verify.v2
        .services(serviceSid)
        .verifications.create({ to: phone_number, channel: "sms" });
    } catch (error) {
      console.log(error);
    }

    res.status(200).json({
      success: true,
      message: "Verification code sent successfully.",
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: "An error occurred while processing the request." });
  }
};

export const verifyOtp = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { phone_number, otp } = req.body;
    const serviceSid = process.env.TWILIO_SERVICE_SID;

    if (!serviceSid) {
      throw new Error("Missing TWILIO_SERVICE_SID in environment variables.");
    }

    // 1. Verify OTP with Twilio first
    const verificationCheck = await client.verify.v2
      .services(serviceSid)
      .verificationChecks.create({ to: phone_number, code: otp });

    // 2. Early return if OTP is invalid
    if (verificationCheck.status !== "approved") {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP. Please try again.",
      });
    }

    // 3. Find or create user after successful verification
    let user = await prisma.user.findUnique({
      where: { phone_number },
    });

    if (user) {
      return res.status(200).json({
        success: true,
        message: "OTP verified successfully. Welcome back!",
        user,
      });
    }

    // New user registration path
    user = await prisma.user.create({
      data: { phone_number },
    });

    return res.status(201).json({
      success: true,
      message: "User registered and verified successfully.",
      user,
    });
  } catch (error) {
    console.error("verifyOtp error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while verifying OTP.",
    });
  }
};

export const signupNewUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId, email, name } = req.body;
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (user?.email === null) {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          email: email,
          name: name,
        },
      });
      res.status(200).json({
        success: true,
        user: updatedUser || user,
      });
    } else {
      res.status(400).json({
        success: false,
        message: "User already has an email associated.",
      });
    }
  } catch (error) {
    console.error("signupNewUser error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while signing up the new user.",
    });
  }
};

export const sendOtpToEmail = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, name, userId } = req.body;
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    const user = {
      userId,
      name,
      email,
    };
    const token = jwt.sign(
      {
        user,
        otp,
      },
      process.env.EMAIL_ACTIVATION_SECRET!,
      {
        expiresIn: "5m",
      },
    );

    try {
      await nylas.messages.send({
        identifier: process.env.USER_GRANT_ID!,
        requestBody: {
          to: [{ name: name, email: email }],
          subject: "Verify your email address",
          body: `Hello ${name},\n\nYour RideWave OTP code is: ${otp}\n\nThis code will expire in 5 minutes.\n\nThank you!, <br> RideWave Team`,
        },
      });
    } catch (error) {
      console.error("Error sending OTP email:", error);
    }

    res.status(201).json({
      success: true,
      token,
    });
  } catch (error) {
    console.error("sendOtpToEmail error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while sending OTP to the email.",
    });
  }
};
