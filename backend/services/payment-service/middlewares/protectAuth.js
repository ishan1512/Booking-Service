import jwt from "jsonwebtoken";
import catchAsync from "./catchAsync.js";
import ApiError from "./apiError.js";

export const protectRoute = catchAsync(async (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) {
    throw new ApiError("No access token provided", 401);
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.id,
      email: decoded.email,
    };
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new ApiError("Access token expired", 401);
    }
    throw error;
  }
});
