const Expense = require("../models/expense.model");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

const createExpense = asyncHandler (async (req, res) => {
  const { title, amount, category, date } = req.body;

  if (!title || !amount || !category) {
    throw new ApiError(400, "Title, amount and category are required.");
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

  const expenses = await Expense.find({
    user: req.user._id,
  });

  return res.status(200).json(expenses);

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


  const updatedExpense = await Expense.findOneAndUpdate(
    {
      _id: req.params.id,
      user: req.user._id,
    },
    {
      title,
      amount,
      category,
      date,
    },
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
