const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DriverLocationSchema = new Schema({
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Driver",
    required: true,
    unique: true,
  },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

DriverLocationSchema.index({ location: "2dsphere" });

const DriverCurrentLocation = mongoose.model(
  "DriverCurrentLocation",
  DriverLocationSchema
);

module.exports = DriverCurrentLocation;
