const dns = require("dns");

// Temporary workaround for the system DNS resolver refusing Node DNS queries.
dns.setServers(["1.1.1.1"]);

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer();

