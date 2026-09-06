const Expense = require("../models/expense.model");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { 
  createExpense: createExpenseService, 
  getExpenses: getExpenseService,
  getExpenseById: getExpenseByIdService,
  updateExpense: updateExpenseService,
  deleteExpense: deleteExpenseService,
} = require("../services/expense.service");

const createExpense = asyncHandler (async (req, res) => {
  const { title, amount, category, date } = req.body;

  if (title === undefined || amount === undefined || amount === null || !category) {
    throw new ApiError(400, "Title, amount and category are required.");
  }

  if (typeof title !== "string" || title.trim().length === 0) {
    throw new ApiError(400, "Title must be a non-empty string.");
  }

  if (typeof category !== "string" || category.trim().length === 0) {
    throw new ApiError(400, "Category must be a non-empty string.");
  }

  if(typeof amount !== "number" || amount <=0){
    throw new ApiError(400, "Amount must be a positive number.");
  }
  
  if(date && isNaN(Date.parse(date))){
    throw new ApiError(400, "Invalid Date.");
  }

  const expense = await createExpenseService({
    title,
    amount,
    category,
    date,
    userId: req.user._id,
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

  const result = await getExpenseService({
    userId: req.user._id,
    category,
    startDate,
    endDate,
    page: pageNum,
    limit: limitNum,
    sortBy,
    order,
  });

  return res.status(200).json(result);
});

const getExpenseById = asyncHandler(async (req, res) => {
  const expense = await getExpenseByIdService({
    expenseId: req.params.id,
    userId: req.user._id,
  });

  if (!expense) {
    throw new ApiError(404, "Expense not found");
  }

  return res.status(200).json(expense);
});

const updateExpense = asyncHandler (async (req, res) => {
  const { title, amount, category, date } = req.body;

  const updateData = {};

  if (title !== undefined && (typeof title !== "string" || title.trim().length === 0)) {
    throw new ApiError(400, "Title must be a non-empty string.");
  }

  if (category !== undefined && (typeof category !== "string" || category.trim().length === 0)) {
    throw new ApiError(400, "Category must be a non-empty string.");
  }
  if (title !== undefined) updateData.title = title;
  if (category !== undefined) updateData.category = category;
  if (amount !== undefined) updateData.amount = amount;
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


  const updatedExpense = await updateExpenseService({
    expenseId: req.params.id,
    userId: req.user._id,
    updateData,
  });

  if (!updatedExpense) {
    throw new ApiError(404, "Expense not found");
  }

  return res.status(200).json({
    message: "Expense updated successfully",
    expense: updatedExpense,
  });
});


const getExpenseSummary = asyncHandler( async (req, res) =>{
  const summary = await Expense.aggregate([
    {
      $match:{
        user: req.user._id,
      },
    },
    {
      $group: {
        _id: null,
        totalExpense: { $sum: "$amount" },
        expenseCount: { $sum: 1 },
        averageExpense: { $avg: "$amount"},
      },
    },
  ]);

  const result = summary[0] || {
    totalExpense : 0,
    expenseCount: 0,
    averageExpense: 0,
  };

  return res.status(200).json(result);
});

const getMonthlySummary = asyncHandler( async (req, res)=>{
  const monthly = await Expense.aggregate([
    {
      $match: {
        user: req.user._id,
      },
    },
    {
      $group:{
        _id:{
          year: {$year: "$date"},
          month: {$month: "$date"},
        },
        totalExpense: { $sum: "$amount"},
        expenseCount: {$sum : 1},
      },
    },
    {
      $sort: {
        "_id.year": 1,
        "_id.month": 1,
      },
    },
  ]);

  return res.status(200).json({monthly,});
});


const deleteExpense = asyncHandler (async (req, res) => {
  const deletedExpense = await deleteExpenseService({
    expenseId: req.params.id,
    userId: req.user._id,
  });

  if (!deletedExpense) {
    throw new ApiError(404, "Expense not found");
  }

  return res.status(200).json({
    message: "Expense deleted successfully",
  });
});

module.exports = { createExpense, getExpenses, getExpenseById, updateExpense, getExpenseSummary, getMonthlySummary, deleteExpense };
