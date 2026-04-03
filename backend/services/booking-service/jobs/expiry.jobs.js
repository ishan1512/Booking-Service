import cron from "node-cron";
import Booking from "../models/booking.model.js";
import redisClient from "../utils/redisClient.js";

export const startExpiryJob = () => {
  cron.schedule("*/2 * * * *", async () => {
    console.log("Running expiry job.....");

    const expiryTime = new Date(Date.now() - 10 * 60 * 1000);

    //1> find expired booking
    const bookings = await Booking.find({
      status: "pending",
      createdAt: { $lt: expiryTime },
    });

    //2> invalidate cache
    for (const b of bookings) {
      const date = b.startTime.toISOString().split("T")[0];
      await redisClient.del(`availability:${b.resourceId}:${date}`);
    }

    //3> update status
    const result = await Booking.updateMany(
      {
        status: "pending",
        createdAt: { $lt: expiryTime },
      },
      {
        $set: { status: "cancelled" },
      },
    );
    console.log(`Expired ${result.modifiedCount} bookings`);
  });
};
