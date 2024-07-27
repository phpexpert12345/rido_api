const mongoose = require("mongoose");

const rideSchema = new mongoose.Schema({
  start: String,
  end: String,
  distance: String,
  duration: String,
  price: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Ride = mongoose.model("Ride", rideSchema);

module.exports = Ride;
