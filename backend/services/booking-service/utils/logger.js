import { createLogger, format, transports, config } from "winston";

// Custom colors for log levels
const customColors = {
  error: "red bold",
  warn: "yellow",
  info: "cyan",
  http: "magenta",
  verbose: "blue",
  debug: "white",
  silly: "gray",
};

// Apply the custom colors
config.addColors(customColors);

const logger = createLogger({
  level: "info",
  format: format.combine(
    format.colorize({ all: true }),
    format.timestamp(),
    format.errors({ stack: true }),
    format.colorize(),
    format.printf(({ timestamp, level, message, stack }) => {
      return `${timestamp} [${level}]: ${stack || message}`;
    }),
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: "logs/error.log", level: "error" }),
    new transports.File({ filename: "logs/combined.log" }),
  ],
});

export default logger;
