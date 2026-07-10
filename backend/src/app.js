const express = require("express");
const app = express();

app.get("/", (req, res) => {
    res.send("Expense Tracker API");
});

module.exports = app;