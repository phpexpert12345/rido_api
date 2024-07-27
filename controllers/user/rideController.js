const Ride = require("../models/rideModel");
const Customer = require("../models/customerModel");
const updateDriverLocation = require("../services/driverLocationService");
const findNearestDriver = require("../services/driverService");
const sendNotification = require("../services/notificationService");
const calculateRideDetails = require("../services/rideService");
const getWeatherData = require("../services/weatherService");
const getTrafficData = require("../services/trafficService");

const bookRide = async (req, res) => {
  const start =
    "Plot no. BS08, National Highway 24, Siddharth Vihar, Pratap Vihar, Ghaziabad, Uttar Pradesh 201009";
  const end = "Electricity Metro station Noida sector 63";

  const customerId = req.query.customerId;
  const customer = await Customer.findById(customerId);

  const currentHour = new Date().getHours();
  const isPeakTime =
    (currentHour >= 8 && currentHour <= 10) ||
    (currentHour >= 17 && currentHour <= 19);
  const isLateNight = currentHour >= 22 || currentHour < 6;

  // Get weather data for the start location
  const weatherData = await getWeatherData("Ghaziabad");

  // Get traffic data between start and end locations
  const trafficData = await getTrafficData(start, end);

  const options = {
    isRainy: weatherData && weatherData.precip_mm > 0,
    trafficCondition: trafficData || "normal", // Default to 'normal' if traffic data is unavailable
    isPeakTime,
    vehicleType: req.query.vehicleType,
    serviceFee: parseFloat(req.query.serviceFee) || 0,
    geographicalAdjustment: parseFloat(req.query.geographicalAdjustment) || 0,
    promotionalDiscount: parseFloat(req.query.promotionalDiscount) || 0,
    isLateNight,
    waitingTimeInMinutes: parseFloat(req.query.waitingTimeInMinutes) || 0,
  };

  try {
    const rideDetails = await calculateRideDetails(start, end, options);

    // Find the nearest available driver
    const customerLocation = [customer.longitude, customer.latitude]; // Assuming you have these fields in Customer model
    const nearestDriver = await findNearestDriver(customerLocation);

    if (!nearestDriver) {
      return res.status(404).json({ error: "No available drivers found" });
    }

    // Send notification to the nearest driver
    const notificationMessage = {
      title: "New Ride Request",
      body: `Ride from ${start} to ${end}`,
    };
    await sendNotification(
      nearestDriver.android_device_token,
      notificationMessage
    );

    const newRide = new Ride({
      customer: customerId,
      driver: nearestDriver._id,
      start,
      end,
      ...rideDetails,
      status: "pending",
      createdAt: new Date(),
    });

    await newRide.save();

    // Update driver availability
    nearestDriver.on_duty_flag = false;
    await nearestDriver.save();

    res.json(newRide);
  } catch (error) {
    res.status(500).json({ error: "Error booking ride" });
  }
};

module.exports = bookRide;
