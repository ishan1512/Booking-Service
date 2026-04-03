import express from "express";
import {
  cancelBooking,
  confirmBooking,
  createBooking,
  getAvailableSlots,
  getMyBookings,
} from "../controllers/booking.controller.js";
import { protectRoute } from "../middlewares/protectAuth.js";

const router = express.Router();

router.post("/bookslot", protectRoute, createBooking);
router.get("/getavailableslots", protectRoute, getAvailableSlots);
router.post("/cancelbooking/:id", protectRoute, cancelBooking);
router.get("/getmybookings", protectRoute, getMyBookings);
router.patch("/confirmbooking/:id", protectRoute, confirmBooking);

export default router;
