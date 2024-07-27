const DriverCurrentLocation = require("../models/DriverCurrentLocation");
const updateDriverLocation = async (driver_id, location) => {
  try {
    // Log the location to debug
    console.log("Received location for validation:", location);

    if (
      !location ||
      location.type !== "Point" ||
      !Array.isArray(location.coordinates) ||
      location.coordinates.length !== 2 ||
      location.coordinates.some((c) => typeof c !== "number")
    ) {
      throw new Error(
        "Invalid location format. Location must be an object with type 'Point' and coordinates as an array of two numbers."
      );
    }

    const result = await DriverCurrentLocation.findOneAndUpdate(
      { driver: driver_id },
      { location: location, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    return result;
  } catch (error) {
    console.error("Error updating driver location:", error);
    return null;
  }
};

module.exports = updateDriverLocation;
