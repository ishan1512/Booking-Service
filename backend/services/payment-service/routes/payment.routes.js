import express from "express";
import {
  createOrder,
  verifyPayment,
} from "../controllers/payment.controller.js";
import { protectRoute } from "../middlewares/protectAuth.js";

const router = express.Router();

router.post("/create-order", protectRoute, createOrder);
router.post("/verify-payment", protectRoute, verifyPayment);

export default router;
