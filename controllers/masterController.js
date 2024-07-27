const VehicleTypeMaster = require("../models/VehicleTypeMaster"); // Ensure the correct model path
// InsertVehicle function
exports.InsertVehicle = async (req, res) => {
  try {
    const { vehicle_name, vehicle_description } = req.body;

    if (!vehicle_name) {
      return res.status(400).json({
        status: false,
        status_code: 400,
        message: "Vehicle Type Name is required",
      });
    }

    if (!vehicle_description) {
      return res.status(400).json({
        status: false,
        status_code: 400,
        message: "Vehicle Description is required",
      });
    }

    // Check for duplicate entry
    const existingVehicle = await VehicleTypeMaster.findOne({ vehicle_name });
    if (existingVehicle) {
      return res.status(409).json({
        status: false,
        status_code: 409,
        message: "Vehicle Type Name already exists",
      });
    }

    let vehicle_icon = "";
    if (req.file) {
      vehicle_icon = req.file.location; // Save the file path (AWS for location expect path)
      console.log("File uploaded:", vehicle_icon); // Debugging log
    } else {
      console.log("No file uploaded");
    }

    const vehicle = new VehicleTypeMaster({
      vehicle_name,
      vehicle_description,
      vehicle_icon,
      admin_status: req.body.admin_status || 0,
      createdAt: req.body.createdAt || new Date(),
      updatedAt: req.body.updatedAt || new Date(),
    });

    await vehicle.save();
    res.status(200).json({
      status: true,
      status_code: 200,
      message: "Vehicle added successfully.",
      vehicle: vehicle,
    });
  } catch (error) {
    console.error("Error inserting vehicle:", error);
    res.status(500).json({
      status: false,
      status_code: 500,
      error: error.message,
      message: "Failed to add vehicle. Please try again later.",
    });
  }
};

exports.updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const { vehicle_name, admin_status, vehicle_description } = req.body;
    let vehicle_icon = req.body.vehicle_icon;

    if (req.file) {
      vehicle_icon = req.file.location; // Save the file path (AWS for location expect path)
    }

    const updatedVehicle = await VehicleTypeMaster.findByIdAndUpdate(
      id,
      {
        vehicle_name,
        vehicle_description,
        vehicle_icon,
        admin_status,
        updatedAt: new Date(),
      },
      { new: true } // Return the updated document
    );

    if (!updatedVehicle) {
      return res.status(404).json({
        status: false,
        status_code: 404,
        message: "Vehicle not found",
      });
    }

    res.status(200).json({
      status: true,
      status_code: 200,
      message: "Vehicle updated successfully",
      vehicle: updatedVehicle,
    });
  } catch (error) {
    console.error("Error updating vehicle:", error);
    res.status(500).json({
      status: false,
      status_code: 500,
      error: error.message,
      message: "Failed to update vehicle. Please try again later.",
    });
  }
};

exports.deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedVehicle = await VehicleTypeMaster.findByIdAndDelete(id);

    if (!deletedVehicle) {
      return res.status(404).json({
        status: false,
        status_code: 404,
        message: "Vehicle not found",
      });
    }

    res.status(200).json({
      status: true,
      status_code: 200,
      message: "Vehicle deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting vehicle:", error);
    res.status(500).json({
      status: false,
      status_code: 500,
      error: error.message,
      message: "Failed to delete vehicle. Please try again later.",
    });
  }
};

exports.getVehiclebyID = async (req, res) => {
  try {
    const { id } = req.params;
    const vehicle = await VehicleTypeMaster.findById(id);

    if (!vehicle) {
      return res.status(404).json({
        status: false,
        status_code: 404,
        message: "Vehicle not found",
      });
    }

    res.status(200).json({
      status: true,
      status_code: 200,
      vehicle: vehicle,
    });
  } catch (error) {
    console.error("Error fetching vehicle:", error);
    res.status(500).json({
      status: false,
      status_code: 500,
      error: error.message,
      message: "Failed to fetch vehicle. Please try again later.",
    });
  }
};

exports.getAllVehicles = async (req, res) => {
  try {
    const vehicles = await VehicleTypeMaster.find();

    if (!vehicles || vehicles.length === 0) {
      return res.status(404).json({
        status: false,
        status_code: 404,
        message: "No vehicles found",
      });
    }

    res.status(200).json({
      status: true,
      status_code: 200,
      vehicles: vehicles,
    });
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    res.status(500).json({
      status: false,
      status_code: 500,
      error: error.message,
      message: "Failed to fetch vehicles. Please try again later.",
    });
  }
};
