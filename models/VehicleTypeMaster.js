const mongoose = require("mongoose");

const vehicleMasterSchema = new mongoose.Schema({
  vehicle_name: { type: String, required: true },
  vehicle_icon: { type: String },
  vehicle_description: { type: String },
  admin_status: {
    type: Number,
    enum: [0, 1],
    default: 0,
    comment: "Active=0, Inactive=1",
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("VehicleTypeMaster", vehicleMasterSchema);
