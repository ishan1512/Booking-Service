import Booking from "../models/booking.model.js";
import redisClient from "../utils/redisClient.js";
import ApiError from "../middlewares/apiError.js";
import catchAsync from "../middlewares/catchAsync.js";
import { generateSlots } from "../utils/generateSlots.js";

export const createBooking = catchAsync(async (req, res, next) => {
  const { resourceId, startTime, endTime } = req.body;
  const userId = req.user.id;

  const lockKey = `lock:${resourceId}:${startTime}`;

  //Try acquiring lock
  const isLocked = await redisClient.set(lockKey, userId, {
    NX: true,
    EX: 60, //lock expires in 60 seconds
  });

  if (!isLocked) {
    throw new ApiError("Slot already booked or being booked", 400);
  }
  try {
    const conflict = await Booking.findOne({
      resourceId,
      status: { $ne: "cancelled" },
      $or: [
        {
          startTime: { $lt: endTime },
          endTime: { $gt: startTime },
        },
      ],
    });

    if (conflict) {
      throw new ApiError("Slot already booked", 400);
    }

    const booking = await Booking.create({
      userId,
      resourceId,
      startTime,
      endTime,
      status: "pending",
    });

    //cache invalidation
    const date = new Date(startTime).toISOString().split("T")[0];
    await redisClient.del(`availability:${resourceId}:${date}`);

    return res.status(201).json(booking);
  } catch (error) {
    console.log("Error in createBooking", error);
    return next(error);
  } finally {
    //release lock if acquired
    await redisClient.del(lockKey);
  }
});

export const getAvailableSlots = catchAsync(async (req, res) => {
  const { resourceId, date } = req.query;

  const cacheKey = `availability:${resourceId}:${date}`;
  //1> check cache first
  const cached = await redisClient.get(cacheKey);
  if (cached) {
    console.log("Cache hit");
    return res.status(200).json(JSON.parse(cached));
  }

  console.log("Cache miss");

  //2> normal logic (only runs if cache miss)
  const startOfDay = new Date(date);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const bookings = await Booking.find({
    resourceId,
    status: { $ne: "cancelled" },
    startTime: { $lt: endOfDay },
    endTime: { $gt: startOfDay },
  });

  //const bookedSlots = bookings.map((b) => b.slotTime.split("T")[1]);
  const allSlots = generateSlots("09:00", "18:00", 60);

  //const availableSlots = allSlots.filter((slot) => !bookedSlots.includes(slot));
  const availableSlots = allSlots.filter((slot) => {
    return !bookings.some((b) => {
      return (
        new Date(slot.start) < b.endTime && new Date(slot.end) > b.startTime
      );
    });
  });
  const response = { availableSlots };

  //3> store in cache
  await redisClient.set(cacheKey, JSON.stringify(response), {
    EX: 300, //5 mins
  });
  return res.status(200).json(response);
});

export const cancelBooking = catchAsync(async (req, res) => {
  const { id } = req.params;
  //console.log("ID:", id);

  const booking = await Booking.findById(id);
  //console.log("Booking found:", booking);

  if (!booking) {
    throw new ApiError("Booking not found", 404);
  }

  if (booking.status === "completed") {
    throw new ApiError("Cannot cancel completed booking", 400);
  }

  // console.log("Booking userId:", booking.userId);
  // console.log("Req user id:", req.user.id);

  if (booking.userId.toString() !== req.user.id) {
    throw new ApiError("Not authorized", 403);
  }

  booking.status = "cancelled";
  await booking.save();

  //cache invalidation
  const date = booking.startTime.toISOString().split("T")[0];
  await redisClient.del(`availability:${booking.resourceId}:${date}`);

  return res.status(200).json({ message: "Booking cancelled successfully" });
});

export const getMyBookings = catchAsync(async (req, res) => {
  const bookings = await Booking.find({
    userId: req.user.id,
  });
  if (!bookings) {
    throw new ApiError("You have no bookings", 404);
  }
  const filteredBookings = bookings.filter((b) => b.status !== "cancelled");
  return res
    .status(200)
    .json({ message: "Here are your bookings", filteredBookings });
});

export const confirmBooking = catchAsync(async (req, res) => {
  const { id } = req.params;

  const booking = await Booking.findById(id);

  if (!booking) {
    throw new ApiError("Booking not found", 404);
  }
  if (booking.status === "confirmed") {
    throw new ApiError("Your booking is already confirmed", 400);
  }

  booking.status = "confirmed";
  await booking.save();

  return res.status(200).json({ message: "Booking confirmed" });
});
