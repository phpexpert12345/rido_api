const express = require("express");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");
const driverRoutes = require("./routes/driverRoutes");
const masterRoutes = require("./routes/masterRoutes");
require("dotenv").config();
const app = express();
app.use(bodyParser.json());

connectDB();

app.use(bodyParser.json());

app.use("/api", driverRoutes);
app.use("/api", masterRoutes); // Use master routes

app.use(express.static("public"));

// Serve the main HTML file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
