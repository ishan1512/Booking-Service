import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import { connectDb } from "./config/db.js";
import authRoutes from "./routes/auth.route.js";
import errorHandler from "./middlewares/errorHandler.js";

const app = express();
dotenv.config();
app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
  console.log("AUTH HIT:", req.method, req.url);
  next();
});

app.use("/api/auth", authRoutes);
app.use((req, res) => {
  res
    .status(404)
    .json({ message: "The route you were looking for was not found" });
});

app.use(errorHandler);

const PORT = 5000;
app.listen(PORT, () => {
  connectDb();
  console.log(`Server is running on port: ${PORT}`);
});
