const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 100
  },
  amount: {
    type: Number,
    required: true,
    min : 0.01
  },
  category: {
    type: String,
    required: true,
    trim : true
  },
  date: {
    type: Date,
    default: Date.now
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
},{ timestamps: true }
);

expenseSchema.index({ 
  user: 1,
  category: 1,
  date: -1
});

module.exports = mongoose.model("Expense", expenseSchema);