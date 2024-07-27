const express = require("express");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");
const driverRoutes = require("./routes/driverRoutes");
const masterRoutes = require("./routes/masterRoutes");
require("dotenv").config();
const app = express();
app.use(bodyParser.json());

connectDB();

app.use("/api", driverRoutes);
app.use("/api", masterRoutes); // Use master routes

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
