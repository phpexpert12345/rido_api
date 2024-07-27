const mongoose = require("mongoose");
//mongodb+srv://<username>:<password>@<cluster-url>/<dbname>?retryWrites=true&w=majority
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // Increase to 30 seconds
      socketTimeoutMS: 45000, // Increase to 45 seconds
    });
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

module.exports = connectDB;
