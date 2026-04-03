import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import bookingRoutes from "./routes/booking.routes.js";
import { connectDb } from "./config/db.js";
import errorHandler from "./middlewares/errorHandler.js";
import { startExpiryJob } from "./jobs/expiry.jobs.js";

const app = express();
app.use(express.json());
dotenv.config();
app.use(cookieParser());

app.use((req, res, next) => {
  console.log("AUTH HIT:", req.method, req.url);
  next();
});

app.use("/api/bookings", bookingRoutes);
app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  connectDb();
  startExpiryJob();
  console.log(`Booking service running on port: ${PORT}`);
});
