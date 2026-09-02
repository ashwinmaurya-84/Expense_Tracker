const express = require("express");

const routes = require("./routes");
const authRoutes = require("./routes/auth.routes");
const expenseRoutes = require("./routes/expense.routes");

const errorHandler = require("./middleware/error.middleware");

const app = express();

app.use(express.json());

app.use("/", routes);
app.use("/auth", authRoutes);
app.use("/expenses", expenseRoutes);

// Always last
app.use(errorHandler);

module.exports = app;