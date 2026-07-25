import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.route";
import Nylas from "nylas";
import driverRouter from "./routes/driver.route";

const app = express();

app.use(
  cors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: "Content-Type, Authorization",
  }),
);
app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());

// nylas
export const nylas = new Nylas({
  apiKey: process.env.NYLAS_API_KEY!,
});

// Routes
app.use("/api/v1", userRouter);
app.use("/api/v1/driver", driverRouter);

// Test
app.get("/", (req: Request, res: Response) => {
  res.send("Hello, World!");
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

export default app;

