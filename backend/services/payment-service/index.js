import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import errorHandler from "./middlewares/errorHandler.js";
import paymentRoutes from "./routes/payment.routes.js";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
  console.log("AUTH HIT:", req.method, req.url);
  next();
});

console.log("ENV CHECK:", process.env.RAZORPAY_KEY_ID);

app.use("/api/payments", paymentRoutes);
app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Payment service running on port: ${PORT}`);
});
