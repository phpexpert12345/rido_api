const Driver = require("../models/Driver");
const DriverCurrentLocation = require("../models/DriverCurrentLocation");

const findNearestDriver = async (customerLocation) => {
  try {
    if (!Array.isArray(customerLocation) || customerLocation.length !== 2) {
      throw new Error(
        "Invalid customer location format. Expected [longitude, latitude]."
      );
    }

    const nearestDriverLocation = await DriverCurrentLocation.findOne({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: customerLocation,
          },
          $maxDistance: 5000, // 5 km radius
        },
      },
    }).populate("driver");

    if (
      !nearestDriverLocation ||
      !nearestDriverLocation.driver.on_duty_flag ||
      nearestDriverLocation.driver.admin_status !== 0
    ) {
      return null;
    }

    return nearestDriverLocation.driver;
  } catch (error) {
    console.error("Error finding nearest driver:", error);
    return null;
  }
};

module.exports = findNearestDriver;
