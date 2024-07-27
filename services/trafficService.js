const { Client } = require("@googlemaps/google-maps-services-js");
require("dotenv").config();

const googleMapsClient = new Client({});

const getTrafficData = async (start, end) => {
  try {
    const response = await googleMapsClient.directions({
      params: {
        origin: start,
        destination: end,
        departure_time: "now", // or a specific time for future traffic prediction
        key: process.env.GOOGLE_MAPS_API_KEY,
      },
      timeout: 1000, // milliseconds
    });

    const trafficStatus =
      response.data.routes[0].legs[0].traffic_speed_entry[0].condition; // Adjust based on actual response structure
    return trafficStatus;
  } catch (error) {
    console.error("Error fetching traffic data:", error);
    return null;
  }
};

module.exports = getTrafficData;
