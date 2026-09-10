const express = require("express");
const router = express.Router();

const protect = require("../middleware/auth.middleware");
const { createExpense, getExpenses, getExpenseById, updateExpense, getExpenseSummary, getMonthlySummary, deleteExpense } = require("../controllers/expense.controller");

router.post("/", protect, createExpense);
router.get("/", protect, getExpenses);
router.get("/summary", protect, getExpenseSummary);
router.get("/summary/monthly", protect, getMonthlySummary);
router.get("/:id", protect, getExpenseById);
router.patch("/:id", protect, updateExpense);
router.delete("/:id", protect, deleteExpense);

module.exports = router;