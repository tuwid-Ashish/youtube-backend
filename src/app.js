import express from "express";
import cookieParser from "cookie-parser";
import Cors from "cors";
const app = express();

app.use(
  Cors({
    origin: process.env.CORS_ORIGIN,
    Credential: true,
  }),
);
app.use(express.json({ limit: "18kb" }));
app.use(cookieParser());
app.use(express.static("public"));
app.use(express.urlencoded());

// router import

import userRouter from "./routes/user.router.js";
app.use("/api/v1/users", userRouter);
export { app };
