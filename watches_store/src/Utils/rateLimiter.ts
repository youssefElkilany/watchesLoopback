import rateLimit from 'express-rate-limit';

// Define a custom rate limiter
export const limiter = rateLimit({
 windowMs:1 * 60 * 1000, // 1 minute
  max: 3, // Limit each IP to 100 requests per windowMs
  handler: (req, res) => {
    res.status(429).send('Too many requests, please try again later.');
  },
});
