import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.route";

const app = express();

app.use(
  cors({
    origin: "*", // Allow requests from any origin
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // Allow specific HTTP methods
    allowedHeaders: "Content-Type, Authorization", // Allow specific headers
  }),
);
app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());

// Routes
app.use("/api/v1", userRouter);

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
