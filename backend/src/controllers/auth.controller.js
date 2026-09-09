const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user.model");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

const { registerUser, loginUser } = require("../services/auth.service");

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

    const result = await loginUser({
        email,
        password,
    });


    return res.status(200).json({
        success: true,
        message: "Login successful.",
        data: result,
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