const express = require("express");
const router = express.Router();
const {
  InsertVehicle,
  getVehiclebyID,
  updateVehicle,
  deleteVehicle,
  getAllVehicles,
} = require("../controllers/masterController");
const { upload } = require("../services/UploadAWS3Bucket");

// Create route for inserting vehicle
router.post("/vehicles", upload.single("vehicle_icon"), InsertVehicle);
// Fetch a vehicle by ID
router.get("/vehicles/:id", getVehiclebyID);
// Update a vehicle by ID
router.put("/vehicles/:id", upload.single("vehicle_icon"), updateVehicle);
// Delete a vehicle by ID
router.delete("/vehicles/:id", deleteVehicle);
// Fetch all vehicles
router.get("/vehicles", getAllVehicles);
module.exports = router;
