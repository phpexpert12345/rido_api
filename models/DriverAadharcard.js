const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define schema for Aadharcard
const aadharcardSchema = new Schema({
  driver: { type: Schema.Types.ObjectId, ref: "Driver" }, // Reference to Driver
  aadharcardNumber: String,
  frontImage: String,
  backImage: String,
  admin_verified: { type: Boolean, default: false },
  admin_status: {
    type: Number,
    enum: [0, 1, 2, 3],
    default: 0,
    comment: "Pending=0, In review=1, Approved=2, Rejected=3",
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Create Aadharcard model
const DriverAadharcard = mongoose.model("DriverAadharcard", aadharcardSchema);

module.exports = DriverAadharcard;
