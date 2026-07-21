require("dotenv").config();
import { Request, Response, NextFunction } from "express";
import Twilio from "twilio";

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

export const registerUser = async (
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
    try {
    const  verificationCheck = await client.verify.v2
        .services(serviceSid)
        .verificationChecks.create({ to: phone_number, code: otp });
      if (verificationCheck.status === "approved") {
        res.status(200).json({
          success: true,
          message: "OTP verified successfully.",
        });
      } else {
        res.status(400).json({
          success: false,
          message: "Invalid OTP. Please try again.",
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({
        error: "An error occurred while verifying the OTP.",
      });
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: "An error occurred while processing the request." });
  }
};
