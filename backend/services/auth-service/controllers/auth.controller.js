import User from "../models/user.model.js";
import ApiError from "../middlewares/apiError.js";
import catchAsync from "../middlewares/catchAsync.js";
import { generateToken } from "../utils/token.js";

import bcrypt from "bcryptjs";

export const register = catchAsync(async (req, res) => {
  const { name, email, password } = req.body;
  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError("User already exists", 400);
  }
  const hashedPassword = await bcrypt.hash(password, 12);
  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
  });
  generateToken(newUser._id, res);
  return res.status(201).json({
    message: "New user created",
    newUser,
  });
});

export const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError("Both the fields are required", 400);
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError("User not found", 404);
  }
  const checkPass = await bcrypt.compare(password, user.password);
  if (!checkPass) {
    throw new ApiError("Invalid credentials", 400);
  }
  generateToken(user._id, res);
  return res.status(200).json({
    message: "Logged in successfully",
    user,
  });
});

export const logout = catchAsync(async (req, res) => {
  res.clearCookie("jwt");
  return res.status(200).json({ message: "Logged out successfully" });
});
