const Expense = require("../models/expense.model");

const createExpense = async ({ title, amount, category, date, userId }) => {
  return await Expense.create({
    title,
    amount,
    category,
    date,
    user: userId,
  });
};

const getExpenses = async ({
  userId,
  category,
  startDate,
  endDate,
  page,
  limit,
  sortBy,
  order,
}) => {
  const filter = {
    user: userId,
  };

  if (category) {
    filter.category = category;
  }

  if (startDate || endDate) {
    filter.date = {};

    if (startDate) {
      filter.date.$gte = new Date(startDate);
    }

    if (endDate) {
      filter.date.$lte = new Date(endDate);
    }
  }

  const sortOrder = order === "asc" ? 1 : -1;

  const total = await Expense.countDocuments(filter);
  const expenses = await Expense.find(filter)
    .sort({ [sortBy]: sortOrder })
    .skip((page - 1) * limit)
    .limit(limit);

  return {
    expenses,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getExpenseById = async ({ expenseId, userId }) => {
  return await Expense.findOne({
    _id: expenseId,
    user: userId,
  });
};

const updateExpense = async ({ expenseId, userId, updateData }) => {
  const expense = await Expense.findOneAndUpdate({
    _id: expenseId,
    user: userId,
  }, 
  updateData, 
  {
    new: true,
    runValidators: true,
  });
  return expense;
};

module.exports = {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
}