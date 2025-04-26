import rateLimit from "express-rate-limit";
import { ApiError } from "../utils/ApiError";

export const Limiter = rateLimit({
  windowMs: 20 * 60 * 1000, // 20 minutes
  limit: 20, // limit each IP to 20 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  keyGenerator: (req, res) => {
    return req.ip; // Use the IP address as the key for rate limiting
  },
  handler: (_, __, ___, options) => {
    throw new ApiError(
      options.statusCode || 500, // Default to 500 if not provided
      `There are too many requests. You are only allowed ${
        options.limit
      } requests per ${options.windowMs / 60000} minutes` // Convert milliseconds to minutes
    );
  },
});
