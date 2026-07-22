require("dotenv").config();
import { Request, Response, NextFunction } from "express";
import Twilio from "twilio";
import prisma from "../utils/prisma";
import jwt from "jsonwebtoken";
import { nylas } from "../../server/app";
import { sendToken } from "../utils/send-token";
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
    const { phone_number, otp } = req.body || {};

    // 1. Basic payload validation
    if (!phone_number || !otp) {
      return res.status(400).json({
        success: false,
        message: "Phone number and OTP are required.",
      });
    }

    const serviceSid = process.env.TWILIO_SERVICE_SID;
    if (!serviceSid) {
      throw new Error("Missing TWILIO_SERVICE_SID in environment variables.");
    }

    // 2. Verify OTP with Twilio
    let verificationCheck;
    try {
      verificationCheck = await client.verify.v2
        .services(serviceSid)
        .verificationChecks.create({ to: phone_number, code: otp });
    } catch (twilioError: any) {
      console.error("Twilio verification error:", twilioError);
      return res.status(400).json({
        success: false,
        message: twilioError.message || "Failed to verify OTP with Twilio.",
      });
    }

    // 3. Early return if OTP is invalid/expired
    if (verificationCheck.status !== "approved") {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP. Please try again.",
      });
    }

    // 4. Find existing user (using Prisma schema property name: phoneNumber)
    let user = await prisma.user.findUnique({
      where: { phoneNumber: phone_number },
    });

    if (user) {
      return res.status(200).json({
        success: true,
        message: "OTP verified successfully. Welcome back!",
        user,
      });
    }

    // 5. New user registration path (using Prisma schema property name: phoneNumber)
    user = await prisma.user.create({
      data: { phoneNumber: phone_number },
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

export const verifyEmailOtp = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { otp, token } = req.body;

    if (!otp || !token) {
      return res.status(400).json({
        success: false,
        message: "OTP and token are required.",
      });
    }

    // Verify JWT token
    const newUser: any = jwt.verify(
      token,
      process.env.EMAIL_ACTIVATION_SECRET!,
    );

    // Verify OTP matching
    if (newUser.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP.",
      });
    }

    const { name, email, userId } = newUser.user;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found.",
      });
    }

    // Case 1: User already has an email set
    if (user.email !== null) {
      // If it's already verified with the same email, send token and log them in
      if (user.email === email) {
        return await sendToken(user, res);
      }

      // If set to a different email
      return res.status(400).json({
        success: false,
        message: "This account already has a verified email address.",
      });
    }

    // Case 2: User email is null (unverified/new) -> update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        email: email,
        name: name,
      },
    });

    return await sendToken(updatedUser, res);
  } catch (error: any) {
    console.error("verifyEmailOtp error:", error);

    // Handle invalid or expired JWT token specifically
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "An error occurred while verifying the email OTP.",
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
