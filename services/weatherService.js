const axios = require("axios");
require("dotenv").config();

const getWeatherData = async (location) => {
  try {
    const response = await axios.get(
      `http://api.weatherapi.com/v1/current.json?key=${process.env.WEATHER_API_KEY}&q=${location}`
    );
    return response.data.current;
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return null;
  }
};

module.exports = getWeatherData;
