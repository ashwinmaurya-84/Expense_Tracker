const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user.model");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

const { registerUser } = require("../services/auth.service");

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const result = await registerUser({
    name,
    email,
    password,
  });

  return res.status(201).json({
    success: true,
    message: "Registered successfully.",
    data: result,
  });
});


const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, "Email and password are required.");
    }

    if (!validator.isEmail(email)) {
        throw new ApiError(400, "Please provide a valid email address.");
    }

    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError(401, "Invalid email or password.");
    }

    const isPasswordValid = await bcrypt.compare(
        password,
        user.password
    );

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid email or password.");
    }

    const token = jwt.sign(
        {
            id: user._id,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1d",
        }
    );

    return res.status(200).json({
        success: true,
        message: "Login successful.",
        data: {
            token,
        },
    });
});

const getProfile = asyncHandler(async (req, res)=>{
    
    return res.status(200).json({
        success: true,
        message: "Profile retrieved successfully.",
        data: {
            user : req.user
        }
    });
});

module.exports = {
    register,
    login,
    getProfile
};