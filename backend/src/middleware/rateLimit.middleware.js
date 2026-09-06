const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit : 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,

  skip: () => process.env.NODE_ENV === "test",
  
  message:{
    success: false,
    message: "Too many login attempts. Please try again later.",
  },
});


module.exports = {
  loginLimiter,
}