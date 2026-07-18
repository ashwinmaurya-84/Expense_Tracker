const validator = require("validator");
const User = require("../models/user.model")

const register = async(req, res)=>{
  const {name, email, password} = req.body;
  if( !name || !email || !password){
    return res.status(400).json({message:"Name, email, and password are required."});
  }
  if(!validator.isEmail(email)){
    return res.status(400).json({message:"Please provide a valid email address."});
  }
  const existingUser = await User.findOne({ email });
  if(existingUser){
    return res.status(400).json({message: "User already exists"});
  }
};

module.exports = {register};