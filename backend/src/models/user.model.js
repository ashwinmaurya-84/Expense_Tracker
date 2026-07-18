const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name : {
    type : String,
    required : true,       // Must be provided
  },
  email : {
    type : String, 
    required : true,
    unique : true,        // Ensures one account per email
    lowercase : true,
    trim : true
  },
  password : {
    type : String,
    required : true        // will be stored as a hash
  },
  
}, {
  timestamps : true        // Adds createdAt and updatedAt automatically
});

module.exports = mongoose.model('User', userSchema);