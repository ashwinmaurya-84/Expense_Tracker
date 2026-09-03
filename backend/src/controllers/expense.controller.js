const Expense = require("../models/expense.model");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

const createExpense = asyncHandler (async (req, res) => {
  const { title, amount, category, date } = req.body;

  if (!title || amount === undefined || amount === null || !category) {
    throw new ApiError(400, "Title, amount and category are required.");
  }

  if(typeof amount !== "number" || amount <=0){
    throw new ApiError(400, "Amount must be a positive number.");
  }
  
  if(date && isNaN(Date.parse(date))){
    throw new ApiError(400, "Invalid Date.");
  }

  const expense = await Expense.create({
    title,
    amount,
    category,
    date,
    user: req.user._id,
  });

  return res.status(201).json({
    message: "Expense created successfully",
    expense,
  });
});

const getExpenses = asyncHandler (async (req, res) => {

  const { category, startDate, endDate, page = 1, limit = 10, sortBy = "date", order = "desc" } =  req.query;
  const allowedSortFields = ["date", "amount", "title", "createdAt"];

  const pageNum = Number(page);
  const limitNum = Number(limit);

  const filter = {
    user: req.user._id,
  };
  

  if(!allowedSortFields.includes(sortBy)){
    throw new ApiError(400, "Invalid Sort field.");
  }
  if( !["asc", "desc"].includes(order)){
    throw new ApiError(400, "Order must be asc or desc.");
  }


  if( !Number.isInteger(pageNum) || pageNum < 1){
    throw new ApiError(400, "Page must be a positive integer.");
  }
  if(!Number.isInteger(limitNum) || limitNum < 1 || limitNum > 100){
    throw new ApiError(400, "Limit must be between 1 and 100.");
  }
  

  if(startDate && isNaN(Date.parse(startDate))){
    throw new ApiError(400, "Invalid startDate.");
  }
  if(endDate && isNaN(Date.parse(endDate))){
    throw new ApiError(400, "Invalid endDate.");
  }
  if(startDate && endDate && new Date(startDate) > new Date(endDate)){
    throw new ApiError(400, "startDate cannot be greater than endDate.");
  }


  if(category){
    filter.category = category;
  }
  if(startDate || endDate){
    filter.date = {};
   
    if(startDate){
      filter.date.$gte = new Date(startDate);
    }
    if(endDate){
      filter.date.$lte = new Date(endDate);
    }
  }

  const sortOrder = order === "asc"? 1 : -1;

  const total = await Expense.countDocuments(filter);

  const expenses = await Expense.find(filter)
    .sort({[sortBy]: sortOrder})
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum);

  return res.status(200).json({
    expenses,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    }
  });

});

const getExpenseById = asyncHandler (async (req, res) => {
  const expense = await Expense.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!expense) {
    throw new ApiError(404, "Expense not found");
  }

  return res.status(200).json(expense);
});

const updateExpense = asyncHandler (async (req, res) => {
  const { title, amount, category, date } = req.body;

  const updateData = {};

  if (title !== undefined) updateData.title = title;
  if (amount !== undefined) updateData.amount = amount;
  if (category !== undefined) updateData.category = category;
  if (date !== undefined) updateData.date = date;

  if(Object.keys(updateData).length === 0) {
    throw new ApiError(400, "At least one field is required.");
  }

  if(amount !== undefined && (typeof amount !== "number" || amount <= 0)){
    throw new ApiError(400, "Amount must be a positive number.");
  }

  if(date !== undefined && isNaN(Date.parse(date))){
    throw new ApiError(400, "Invalid Date.");
  }


  const updatedExpense = await Expense.findOneAndUpdate(
    {
      _id: req.params.id,
      user: req.user._id,
    },
    updateData,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedExpense) {
    throw new ApiError(404, "Expense not found");
  }

  return res.status(200).json({
    message: "Expense updated successfully",
    expense: updatedExpense,
  });
});



const deleteExpense = asyncHandler (async (req, res) => {
  const deletedExpense = await Expense.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!deletedExpense) {
    throw new ApiError(404, "Expense not found");
  }

  return res.status(200).json({
    message: "Expense deleted successfully",
  });
});

module.exports = { createExpense, getExpenses, getExpenseById, updateExpense, deleteExpense };
