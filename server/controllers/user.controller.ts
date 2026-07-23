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

    await client.verify.v2
      .services(serviceSid)
      .verifications.create({ to: phone_number, channel: "sms" });

    return res.status(200).json({
      success: true,
      message: "Verification code sent successfully.",
    });
  } catch (error: any) {
    console.error("LoginUser error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "An error occurred while sending OTP.",
    });
  }
};

export const verifyOtp = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { phone_number, otp } = req.body || {};

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

    if (verificationCheck.status !== "approved") {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP. Please try again.",
      });
    }

    let user = await prisma.user.findUnique({
      where: { phoneNumber: phone_number },
    });

    // Existing user -> Send token and exit cleanly
    if (user) {
      return await sendToken(user, res);
    }

    // New user -> Register and send token
    user = await prisma.user.create({
      data: { phoneNumber: phone_number },
    });

    return await sendToken(user, res);
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

    const newUser: any = jwt.verify(
      token,
      process.env.EMAIL_ACTIVATION_SECRET!,
    );

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

    if (user.email !== null) {
      if (user.email === email) {
        return await sendToken(user, res);
      }

      return res.status(400).json({
        success: false,
        message: "This account already has a verified email address.",
      });
    }

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

    const user = { userId, name, email };
    const token = jwt.sign(
      { user, otp },
      process.env.EMAIL_ACTIVATION_SECRET!,
      { expiresIn: "5m" },
    );

    await nylas.messages.send({
      identifier: process.env.USER_GRANT_ID!,
      requestBody: {
        to: [{ name: name, email: email }],
        subject: "Verify your email address",
        body: `Hello ${name},\n\nYour RideWave OTP code is: ${otp}\n\nThis code will expire in 5 minutes.\n\nThank you!\nRideWave Team`,
      },
    });

    return res.status(200).json({
      success: true,
      token,
    });
  } catch (error) {
    console.error("sendOtpToEmail error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while sending OTP to the email.",
    });
  }
};

export const getLoggedInUserData = async (req: any, res: Response) => {
  try {
    const user = req.user;

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("getLoggedInUserData error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user data.",
    });
  }
};

export const getAllRides = async (req: any, res: Response) => {
  try {
    const rides = await prisma.rides.findMany({
      where: {
        userId: req.user?.id,
      },
      include: {
        driver: true,
        user: true,
      },
    });

    return res.status(200).json({
      success: true,
      rides,
    });
  } catch (error) {
    console.error("getAllRides error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user rides.",
    });
  }
};
