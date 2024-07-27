const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Driver",
    required: true,
  },
  //vehicle_type_id: { type: mongoose.Schema.Types.ObjectId, ref: "VehicleType" },
  vehicle_type_id: { type: String },
  vehicle_name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("DriverService", serviceSchema);
