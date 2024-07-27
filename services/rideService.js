const { Client } = require("@googlemaps/google-maps-services-js");
require("dotenv").config();

const googleMapsClient = new Client({});

const calculateRideDetails = async (start, end, options) => {
  try {
    const response = await googleMapsClient.distancematrix({
      params: {
        origins: [start],
        destinations: [end],
        key: process.env.GOOGLE_MAPS_API_KEY,
      },
      timeout: 1000, // milliseconds
    });

    const distanceInMeters = response.data.rows[0].elements[0].distance.value;
    const durationInSeconds = response.data.rows[0].elements[0].duration.value;

    const distanceInKm = distanceInMeters / 1000;
    const durationInMinutes = durationInSeconds / 60;

    let baseFare = 50;
    let perKmFare = 10;
    let totalFare = baseFare + distanceInKm * perKmFare;

    // Apply dynamic pricing based on the options provided
    if (options.isRainy) {
      totalFare *= 1.2; // 20% increase for rainy weather
    }

    if (options.trafficCondition === "heavy") {
      totalFare *= 1.3; // 30% increase for heavy traffic
    }

    if (options.isPeakTime) {
      totalFare *= 1.5; // 50% increase during peak hours
    }

    if (options.vehicleType === "auto-rickshaw") {
      totalFare *= 1.1; // 10% increase for auto-rickshaws
    }

    if (distanceInKm > 10 && distanceInKm <= 20) {
      totalFare *= 1.1; // 10% increase for medium-distance trips
    } else if (distanceInKm > 20) {
      totalFare *= 1.2; // 20% increase for long-distance trips
    }

    if (options.serviceFee) {
      totalFare += options.serviceFee; // Adding additional service fees
    }

    if (options.geographicalAdjustment) {
      totalFare += options.geographicalAdjustment; // Adjustment for geographical factors
    }

    if (options.promotionalDiscount) {
      totalFare -= options.promotionalDiscount; // Apply promotional discount
    }

    if (options.isLateNight) {
      totalFare *= 1.2; // 20% increase for late-night rides
    }

    if (options.waitingTimeInMinutes) {
      totalFare += options.waitingTimeInMinutes * 2; // Charge for waiting time
    }

    return {
      distance: distanceInKm.toFixed(2) + " km",
      duration: durationInMinutes.toFixed(2) + " mins",
      price: totalFare.toFixed(2) + " INR",
    };
  } catch (error) {
    console.error("Error calculating distance:", error);
    throw error;
  }
};

module.exports = calculateRideDetails;
