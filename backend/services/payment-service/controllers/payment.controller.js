import Booking from "../../booking-service/models/booking.model.js";
import catchAsync from "../middlewares/catchAsync.js";
import ApiError from "../middlewares/apiError.js";
import { razorpay } from "../utils/razorpay.js";

export const createOrder = catchAsync(async (req, res) => {
  const { bookingId, amount } = req.body;
  const instance = razorpay();

  const options = {
    amount: amount * 100, //paise
    currency: "INR",
    receipt: `receipt_${bookingId}`,
  };

  const order = await instance.orders.create(options);

  return res.status(201).json({
    message: "Your order created successfully. Verifying payment",
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
  });
});

export const verifyPayment = catchAsync(async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    bookingId,
  } = req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    throw new ApiError("Payment verification failed", 400);
  }

  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw new ApiError("Booking not found", 404);
  }

  booking.status = "confirmed";
  await booking.save();

  return res
    .status(200)
    .json({ message: "Payment verified, your booking is confirmed" });
});
export const checkpay = catchAsync(async (req, res) => {});
