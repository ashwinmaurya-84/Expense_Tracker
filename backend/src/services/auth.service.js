const bcrypt = require("bcrypt");
const validator = require("validator");
const User = require("../models/user.model");
const ApiError = require("../utils/ApiError");


const registerUser = async ({ name, email, password }) => {
  if (!name || !email || !password) {
    throw new ApiError(400, "Name, email and password are required.");
  }

  if (!validator.isEmail(email)) {
    throw new ApiError(400, "Please provide a valid email address.");
  }

  if (
    !validator.isStrongPassword(password, {
      minLength: 8,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 0,
    })
  ) {
    throw new ApiError(
      400,
      "Password does not meet security requirements."
    );
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError(409, "User already exists.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  return {
    id: newUser._id,
    name: newUser.name,
    email: newUser.email,
  };
};

module.exports = {
  registerUser,
};