const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// Define schema for Driver
const driverSchema = new Schema({
  firstname: { type: String },
  lastname: { type: String },
  email: { type: String },
  phone: { type: String, required: true, unique: true, index: true },
  otp: { type: String, index: true },
  verified: { type: Boolean, default: false },
  admin_verified: { type: Boolean, default: false }, // New field
  on_duty_flag: { type: Boolean, default: false },
  ride_no_days: { type: String },
  android_device_token: { type: String },
  admin_status: {
    type: Number,
    enum: [0, 1],
    default: 0,
    comment: "Active=0, In Active=1",
  },
  dob: { type: Date },
  gender: { type: String },
  password: { type: String },
  profilePhoto: { type: String },
  language: { type: String }, // Corrected typo: langauge to language
  documents: {
    driver_pancard: { type: Schema.Types.ObjectId, ref: "DriverPancard" },
    driver_aadharcard: { type: Schema.Types.ObjectId, ref: "DriverAadharcard" },
    driver_service: { type: Schema.Types.ObjectId, ref: "DriverService" },
    driver_location: { type: Schema.Types.ObjectId, ref: "DriverLocation" },
    driver_dl: { type: Schema.Types.ObjectId, ref: "DriverDL" },
    driver_registrationCertificate: {
      type: Schema.Types.ObjectId,
      ref: "DriverRegistrationCertificate",
    },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Create Driver model
const Driver = mongoose.model("Driver", driverSchema);

module.exports = Driver;
