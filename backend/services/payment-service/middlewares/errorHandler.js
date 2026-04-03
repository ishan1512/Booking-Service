import logger from "../utils/logger.js";

const errorHandler = (err, req, res, next) => {
  logger.error(`${err.name}: ${err.message}`);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";

  return res.status(statusCode).json({
    success: false,
    message,
    stack: err.stack,
  });
};
export default errorHandler;
