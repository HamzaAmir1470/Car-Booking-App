import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../utils/prisma";

export const isAuthenticated = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Please login to access this content.",
      });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Please login to access this content.",
      });
    }

    // Verify synchronously without a callback
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as {
      id: string;
    };

    const userData = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!userData) {
      return res.status(401).json({
        success: false,
        message: "User not found.",
      });
    }

    req.user = userData;
    return next(); // Synchronous flow — single next() call!
  } catch (error) {
    console.log("isAuthenticated error:", error);
    return res.status(401).json({
      success: false,
      message: "Token is invalid or expired. Please login again.",
    });
  }
};


export const isAuthenticatedDriver = (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    // Extract the token from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res
        .status(401)
        .json({ message: "Please Log in to access this content!" });
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Token missing" });
    }

    // Verify the token
    jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET!,
      async (err: any, decoded: any) => {
        if (err) {
          return res.status(401).json({ message: "Invalid token" });
        }

        const driverData = await prisma.driver.findUnique({
          where: {
            id: decoded.id,
          },
        });
        // Attach the user data to the request object
        req.driver = driverData;
        next();
      }
    );
  } catch (error) {
    console.log(error);
  }
};