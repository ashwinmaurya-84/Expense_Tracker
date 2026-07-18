const express = require("express");
const routes = require("./routes");
const authRoutes = require("./routes/auth.routes");
const app = express();

app.use("/",routes);
app.use("/auth", authRoutes);

module.exports = app;