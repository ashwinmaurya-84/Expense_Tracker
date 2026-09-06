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

const deleteExpense = async ({ expenseId, userId }) => {
  const expense = await Expense.findOneAndDelete({
    _id: expenseId,
    user: userId,
  });
  return expense;
};

const getExpenseSummary = async ({ userId }) => {
  const summary = await Expense.aggregate([
    {
      $match: {
        user: userId,
      },
    },
    {
      $group: {
        _id: null,
        totalExpense: { $sum: "$amount"},
        expenseCount: { $sum: 1},
        averageExpense: { $avg : "$amount"},
      },
    },
  ]);

  return summary[0] || {
    totalExpense: 0,
    expenseCount: 0,
    averageExpense: 0,
  };
};

module.exports = {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getExpenseSummary,
}