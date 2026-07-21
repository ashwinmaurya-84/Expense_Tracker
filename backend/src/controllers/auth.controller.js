const validator = require("validator");
const bcrypt = require("bcrypt");
const User = require("../models/user.model")

const register = async(req, res)=>{
  const { name, email, password } = req.body;
  if( !name || !email || !password){
    return res.status(400).json({message:"Name, email, and password are required."});
  }
  if(!validator.isEmail(email)){
    return res.status(400).json({message:"Please provide a valid email address."});
  }
 
  
  if (!validator.isStrongPassword(password, {
      minLength: 8,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 0
      })
    ) {
      return res.status(400).json({
          message: "Password does not meet security requirements."
      });
  }

  try {
    const existingUser = await User.findOne({ email });
    if(existingUser){
      return res.status(400).json({message: "User already exists"});
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashedPassword
    });
    await newUser.save();
    return res.status(201).json({ message: "Registered Successfully"});
  } 
  catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Something went wrong."});
  }
};

const login = async(req, res)=>{
  const { email, password } = req.body;
  if( !email || !password){
    return res.status(400).json({message:"Email and password are required."});
  }
  if(!validator.isEmail(email)){
    return res.status(400).json({message:"Please provide a valid email address."});
  }

  try {
    const user = await User.findOne({ email });
    if ( !user ){
      return res.status(401).json({ message: "Invalid email or password"});
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid){
      return res.status(401).json({ message: "Invalid email or password"});
    }
    return res.status(200).json({ message: "Login Successful"});
  }catch (err){
    return res.status(500).json({ message: "Something went wrong"});
  }
};

module.exports = {register, login};