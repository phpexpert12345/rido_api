const Driver = require("../models/Driver");
const DriverPancard = require("../models/DriverPancard");
const DriverAadharcard = require("../models/DriverAadharcard");
const DriverRegistrationCertificate = require("../models/DriverRegistrationCertificate");
const DriverDL = require("../models/DriverDL");
const DriverLocation = require("../models/DriverLocation");
const DriverCurrentLocation = require("../models/DriverCurrentLocation");
const DriverService = require("../models/DriverService");
const { sendOtp, verifyOtp } = require("../services/otpService");
const updateDriverLocation = require("../services/driverLocationService");

exports.sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({
        status: false,
        status_code: 400,
        message: "Phone number is required",
      });
    }
    // Send OTP
    await sendOtp(phone);
    res.status(200).json({
      status: true,
      status_code: 200,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("Error sending OTP:", error.message);
    res.status(500).json({
      status: false,
      status_code: 500,
      message: "Failed to send OTP. Please try again later.",
    });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { phone, otp, language } = req.body;
    // Validate phone and OTP presence
    if (!phone) {
      return res.status(400).json({
        status: false,
        status_code: 400,
        message: "Phone number is required",
      });
    }
    if (!otp) {
      return res.status(400).json({
        status: false,
        status_code: 400,
        message: "OTP Code is required",
      });
    }
    // Verify OTP
    const driver = await verifyOtp(phone, otp, language);
    // OTP verified successfully
    res.status(200).json({
      status: true,
      status_code: 200,
      message: "OTP verified successfully",
      driver: driver, // Include driver data in response if needed
    });
  } catch (error) {
    // Handle errors (e.g., invalid OTP)
    console.error("Error verifying OTP:", error.message);
    let errorMessage = "Failed to verify OTP. Please try again later.";
    let statusCode = 500;
    if (error.message === "Invalid OTP") {
      errorMessage = "Invalid OTP. Please enter the correct OTP.";
      statusCode = 400;
    }
    res.status(statusCode).json({
      status: false,
      status_code: statusCode,
      message: errorMessage,
    });
  }
};

exports.getDriverDetails = async (req, res) => {
  try {
    const { driver_id } = req.params;
    // Validate driver_id presence
    if (!driver_id) {
      return res.status(400).json({
        status: false,
        status_code: 400,
        message: "Driver ID is required",
      });
    }

    // Get Driver Information with proper population
    const driver = await Driver.findById(driver_id)
      .populate("documents.driver_pancard")
      .populate("documents.driver_aadharcard")
      .populate("documents.driver_location")
      .populate("documents.driver_service")
      .populate("documents.driver_dl")
      .populate("documents.driver_registrationCertificate");

    if (!driver) {
      return res.status(404).json({
        status: false,
        status_code: 404,
        message: "Driver not found.",
      });
    }

    const populatedDriver = {
      ...driver.toJSON(),
      documents: {
        driver_pancard: driver.documents.driver_pancard || {},
        driver_aadharcard: driver.documents.driver_aadharcard || {},
        driver_registrationCertificate:
          driver.documents.driver_registrationCertificate || {},
        driver_location: driver.documents.driver_location || {},
        driver_service: driver.documents.driver_service || {},
        driver_dl: driver.documents.driver_dl || {},
      },
    };
    // Return driver information including populated documents
    res.status(200).json({
      status: true,
      status_code: 200,
      message: "Driver found.",
      driver: populatedDriver,
    });
  } catch (error) {
    console.error("Error fetching driver details:", error);
    res.status(500).json({
      status: false,
      status_code: 500,
      message: "Failed to verify Driver ID. Please try again later.",
    });
  }
};

// Update Driver Profile Information
exports.UpdateDrivers = async (req, res) => {
  try {
    const {
      driver_id,
      firstname,
      lastname,
      email,
      dob,
      gender,
      city_name,
      latitude,
      longitude,
      vehicle_type_id,
      vehicle_name,
    } = req.body;

    // Validate driver_id presence
    if (!driver_id) {
      return res.status(400).json({
        status: false,
        status_code: 400,
        message: "Driver ID is required",
      });
    }

    // Get Driver Information with proper population
    let driver = await Driver.findById(driver_id)
      .populate("documents.driver_pancard")
      .populate("documents.driver_aadharcard")
      .populate("documents.driver_registrationCertificate")
      .populate("documents.driver_location")
      .populate("documents.driver_dl")
      .populate("documents.driver_service");

    if (!driver) {
      return res.status(404).json({
        status: false,
        status_code: 404,
        message: "Driver not found.",
      });
    }

    // Update driver fields if provided
    if (firstname) driver.firstname = firstname;
    if (lastname) driver.lastname = lastname;
    if (email) driver.email = email;
    if (dob) driver.dob = dob;
    if (gender) driver.gender = gender;

    // Update or create location fields
    if (city_name || latitude || longitude) {
      let driver_location;
      if (driver.documents.driver_location) {
        driver_location = await DriverLocation.findById(
          driver.documents.driver_location
        );
        if (!driver_location) {
          return res.status(404).json({
            status: false,
            status_code: 404,
            message: "Location not found.",
          });
        }
      } else {
        driver_location = new DriverLocation({ driver: driver._id });
      }

      if (city_name) driver_location.city_name = city_name;
      if (latitude) driver_location.latitude = latitude;
      if (longitude) driver_location.longitude = longitude;

      await driver_location.save();
      driver.documents.driver_location = driver_location._id;
    }

    // Update or create vehicle fields
    if (vehicle_type_id || vehicle_name) {
      let driver_service;
      if (driver.documents.driver_service) {
        driver_service = await DriverService.findById(
          driver.documents.driver_service
        );
        if (!driver_service) {
          return res.status(404).json({
            status: false,
            status_code: 404,
            message: "Service not found.",
          });
        }
      } else {
        driver_service = new DriverService({ driver: driver._id });
      }

      if (vehicle_type_id) driver_service.vehicle_type_id = vehicle_type_id;
      if (vehicle_name) driver_service.vehicle_name = vehicle_name;

      await driver_service.save();
      driver.documents.driver_service = driver_service._id;
    }

    // Save the driver document
    await driver.save();

    // Populate the updated driver document
    const populatedDriver = await Driver.findById(driver_id)
      .populate("documents.driver_pancard")
      .populate("documents.driver_aadharcard")
      .populate("documents.driver_registrationCertificate")
      .populate("documents.driver_location")
      .populate("documents.driver_service")
      .populate("documents.driver_dl")
      .lean();

    // Return driver information including populated documents
    res.status(200).json({
      status: true,
      status_code: 200,
      message: "Driver updated successfully.",
      driver: populatedDriver,
    });
  } catch (error) {
    console.error("Error updating driver details:", error);
    res.status(500).json({
      status: false,
      status_code: 500,
      error: error.message,
      message: "Failed to update driver details. Please try again later.",
    });
  }
};

// Upload Driver Document - DL Information

exports.UploadDLDocument = async (req, res) => {
  try {
    const { driver_id, DLNumber } = req.body;

    if (!driver_id) {
      return res.status(400).json({
        status: false,
        status_code: 400,
        message: "Driver ID is required",
      });
    }

    if (!DLNumber) {
      return res.status(400).json({
        status: false,
        status_code: 400,
        message: "Driving License Number is required",
      });
    }

    let driver = await Driver.findById(driver_id)
      .populate("documents.driver_pancard")
      .populate("documents.driver_aadharcard")
      .populate("documents.driver_registrationCertificate")
      .populate("documents.driver_location")
      .populate("documents.driver_dl")
      .populate("documents.driver_service");

    if (!driver) {
      return res.status(404).json({
        status: false,
        status_code: 404,
        message: "Driver not found.",
      });
    }

    // Check if the DL document already exists for this driver and DLNumber
    let driverDLDocument = await DriverDL.findOne({
      driver: driver_id,
      DLNumber: DLNumber,
    });

    if (driverDLDocument) {
      // If DL document already exists, update it
      if (req.files && req.files.frontImage) {
        driverDLDocument.frontImage = req.files.frontImage[0].location; // Save the file path (AWS for location expect path)
      }
      if (req.files && req.files.backImage) {
        driverDLDocument.backImage = req.files.backImage[0].location; // Save the file path (AWS for location expect path)
      }
      driverDLDocument.updatedAt = new Date();
    } else {
      // If DL document does not exist, create a new one
      const frontImage =
        req.files && req.files.frontImage
          ? req.files.frontImage[0].location
          : "";
      const backImage =
        req.files && req.files.backImage ? req.files.backImage[0].location : "";

      driverDLDocument = new DriverDL({
        DLNumber,
        driver: driver_id,
        frontImage,
        backImage,
        admin_status: req.body.admin_status || 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // Save the DL document
    await driverDLDocument.save();

    // Link the DL document to the driver
    driver.documents.driver_dl = driverDLDocument._id;

    // Save the driver document
    await driver.save();

    // Populate the updated driver document
    const populatedDriver = await Driver.findById(driver_id)
      .populate("documents.driver_pancard")
      .populate("documents.driver_aadharcard")
      .populate("documents.driver_registrationCertificate")
      .populate("documents.driver_location")
      .populate("documents.driver_service")
      .populate("documents.driver_dl")
      .lean();

    // Return driver information including populated documents
    res.status(200).json({
      status: true,
      status_code: 200,
      message: "Driving License added/updated successfully.",
      driver: populatedDriver,
    });
  } catch (error) {
    console.error("Error updating Driving License details:", error);
    res.status(500).json({
      status: false,
      status_code: 500,
      error: error.message,
      message:
        "Failed to update Driving License details. Please try again later.",
    });
  }
};

// Upload Driver Document - Pancard Information

exports.UploadPancardDocument = async (req, res) => {
  try {
    const { driver_id, pancardNumber } = req.body;

    if (!driver_id) {
      return res.status(400).json({
        status: false,
        status_code: 400,
        message: "Driver ID is required",
      });
    }

    if (!pancardNumber) {
      return res.status(400).json({
        status: false,
        status_code: 400,
        message: "Pancard Number is required",
      });
    }

    let driver = await Driver.findById(driver_id)
      .populate("documents.driver_pancard")
      .populate("documents.driver_aadharcard")
      .populate("documents.driver_registrationCertificate")
      .populate("documents.driver_location")
      .populate("documents.driver_dl")
      .populate("documents.driver_service");

    if (!driver) {
      return res.status(404).json({
        status: false,
        status_code: 404,
        message: "Driver not found.",
      });
    }

    // Check if the Pancard document already exists for this driver and pancardNumber
    let driverPancardDocument = await DriverPancard.findOne({
      driver: driver_id,
      pancardNumber: pancardNumber,
    });

    if (driverPancardDocument) {
      // If Pancard document already exists, update it
      if (req.files && req.files.frontImage) {
        driverPancardDocument.frontImage = req.files.frontImage[0].location;
      }
      if (req.files && req.files.backImage) {
        driverPancardDocument.backImage = req.files.backImage[0].location;
      }
      driverPancardDocument.updatedAt = new Date();
    } else {
      // If Pancard document does not exist, create a new one
      const frontImage =
        req.files && req.files.frontImage
          ? req.files.frontImage[0].location
          : "";
      const backImage =
        req.files && req.files.backImage ? req.files.backImage[0].location : "";

      driverPancardDocument = new DriverPancard({
        pancardNumber,
        driver: driver_id,
        frontImage,
        backImage,
        admin_status: req.body.admin_status || 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // Save the Pancard document
    await driverPancardDocument.save();

    // Link the Pancard document to the driver
    driver.documents.driver_pancard = driverPancardDocument._id;

    // Save the driver document
    await driver.save();

    // Populate the updated driver document
    const populatedDriver = await Driver.findById(driver_id)
      .populate("documents.driver_pancard")
      .populate("documents.driver_aadharcard")
      .populate("documents.driver_registrationCertificate")
      .populate("documents.driver_location")
      .populate("documents.driver_service")
      .populate("documents.driver_dl")
      .lean();

    // Return driver information including populated documents
    res.status(200).json({
      status: true,
      status_code: 200,
      message: "Pancard added/updated successfully.",
      driver: populatedDriver,
    });
  } catch (error) {
    console.error("Error updating Pancard details:", error);
    res.status(500).json({
      status: false,
      status_code: 500,
      error: error.message,
      message: "Failed to update Pancard details. Please try again later.",
    });
  }
};

// Upload Driver Document - Aadharcard Information

exports.UploadAadharcardDocument = async (req, res) => {
  try {
    const { driver_id, aadharcardNumber } = req.body;

    if (!driver_id) {
      return res.status(400).json({
        status: false,
        status_code: 400,
        message: "Driver ID is required",
      });
    }

    if (!aadharcardNumber) {
      return res.status(400).json({
        status: false,
        status_code: 400,
        message: "Aadharcard Number is required",
      });
    }

    let driver = await Driver.findById(driver_id)
      .populate("documents.driver_pancard")
      .populate("documents.driver_aadharcard")
      .populate("documents.driver_registrationCertificate")
      .populate("documents.driver_location")
      .populate("documents.driver_dl")
      .populate("documents.driver_service");

    if (!driver) {
      return res.status(404).json({
        status: false,
        status_code: 404,
        message: "Driver not found.",
      });
    }

    // Check if the Aadharcard document already exists for this driver and aadharcardNumber
    let driverAadharcardDocument = await DriverAadharcard.findOne({
      driver: driver_id,
      aadharcardNumber: aadharcardNumber,
    });

    if (driverAadharcardDocument) {
      // If Pancard document already exists, update it
      if (req.files && req.files.frontImage) {
        driverAadharcardDocument.frontImage = req.files.frontImage[0].location;
      }
      if (req.files && req.files.backImage) {
        driverAadharcardDocument.backImage = req.files.backImage[0].location;
      }
      driverAadharcardDocument.updatedAt = new Date();
    } else {
      // If Pancard document does not exist, create a new one
      const frontImage =
        req.files && req.files.frontImage
          ? req.files.frontImage[0].location
          : "";
      const backImage =
        req.files && req.files.backImage ? req.files.backImage[0].location : "";

      driverAadharcardDocument = new DriverAadharcard({
        aadharcardNumber,
        driver: driver_id,
        frontImage,
        backImage,
        admin_status: req.body.admin_status || 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // Save the Aadharcard document
    await driverAadharcardDocument.save();

    // Link the Aadharcard document to the driver
    driver.documents.driver_aadharcard = driverAadharcardDocument._id;

    // Save the driver document
    await driver.save();

    // Populate the updated driver document
    const populatedDriver = await Driver.findById(driver_id)
      .populate("documents.driver_pancard")
      .populate("documents.driver_aadharcard")
      .populate("documents.driver_registrationCertificate")
      .populate("documents.driver_location")
      .populate("documents.driver_service")
      .populate("documents.driver_dl")
      .lean();

    // Return driver information including populated documents
    res.status(200).json({
      status: true,
      status_code: 200,
      message: "Aadharcard added/updated successfully.",
      driver: populatedDriver,
    });
  } catch (error) {
    console.error("Error updating Aadharcard details:", error);
    res.status(500).json({
      status: false,
      status_code: 500,
      error: error.message,
      message: "Failed to update Aadharcard details. Please try again later.",
    });
  }
};

// Upload Driver Document - DriverRegistrationCertificate Information

exports.UploadDriverRCDocument = async (req, res) => {
  try {
    const { driver_id, rcNumber } = req.body;

    if (!driver_id) {
      return res.status(400).json({
        status: false,
        status_code: 400,
        message: "Driver ID is required",
      });
    }

    if (!rcNumber) {
      return res.status(400).json({
        status: false,
        status_code: 400,
        message: "RC Number is required",
      });
    }

    let driver = await Driver.findById(driver_id)
      .populate("documents.driver_pancard")
      .populate("documents.driver_aadharcard")
      .populate("documents.driver_registrationCertificate")
      .populate("documents.driver_location")
      .populate("documents.driver_dl")
      .populate("documents.driver_service");

    if (!driver) {
      return res.status(404).json({
        status: false,
        status_code: 404,
        message: "Driver not found.",
      });
    }

    // Check if the DriverRegistrationCertificate document already exists for this driver and aadharcardNumber
    let driverRCertificateDocument =
      await DriverRegistrationCertificate.findOne({
        driver: driver_id,
        rcNumber: rcNumber,
      });

    if (driverRCertificateDocument) {
      // If DriverRegistrationCertificate document already exists, update it
      if (req.files && req.files.frontImage) {
        driverRCertificateDocument.frontImage =
          req.files.frontImage[0].location;
      }
      if (req.files && req.files.backImage) {
        driverRCertificateDocument.backImage = req.files.backImage[0].location;
      }
      driverRCertificateDocument.updatedAt = new Date();
    } else {
      // If DriverRegistrationCertificate document does not exist, create a new one
      const frontImage =
        req.files && req.files.frontImage
          ? req.files.frontImage[0].location
          : "";
      const backImage =
        req.files && req.files.backImage ? req.files.backImage[0].location : "";

      driverRCertificateDocument = new DriverRegistrationCertificate({
        rcNumber,
        driver: driver_id,
        frontImage,
        backImage,
        admin_status: req.body.admin_status || 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // Save the DriverRegistrationCertificate document
    await driverRCertificateDocument.save();

    // Link the DriverRegistrationCertificate document to the driver
    driver.documents.driver_registrationCertificate =
      driverRCertificateDocument._id;

    // Save the driver document
    await driver.save();

    // Populate the updated driver document
    const populatedDriver = await Driver.findById(driver_id)
      .populate("documents.driver_pancard")
      .populate("documents.driver_aadharcard")
      .populate("documents.driver_registrationCertificate")
      .populate("documents.driver_location")
      .populate("documents.driver_service")
      .populate("documents.driver_dl")
      .lean();

    // Return driver information including populated documents
    res.status(200).json({
      status: true,
      status_code: 200,
      message: "Registration Certificate added/updated successfully.",
      driver: populatedDriver,
    });
  } catch (error) {
    console.error("Error updating Registration Certificate details:", error);
    res.status(500).json({
      status: false,
      status_code: 500,
      error: error.message,
      message:
        "Failed to update Registration Certificate details. Please try again later.",
    });
  }
};

// Update Driver Profile Information
exports.UpdateDriversProfileInfo = async (req, res) => {
  try {
    const { driver_id, firstname, lastname, dob, gender, ride_no_days } =
      req.body;

    // Validate driver_id presence
    if (!driver_id) {
      return res.status(400).json({
        status: false,
        status_code: 400,
        message: "Driver ID is required",
      });
    }

    // Get Driver Information with proper population
    let driver = await Driver.findById(driver_id)
      .populate("documents.driver_pancard")
      .populate("documents.driver_aadharcard")
      .populate("documents.driver_registrationCertificate")
      .populate("documents.driver_location")
      .populate("documents.driver_dl")
      .populate("documents.driver_service");

    if (!driver) {
      return res.status(404).json({
        status: false,
        status_code: 404,
        message: "Driver not found.",
      });
    }

    // Update driver fields if provided
    if (firstname) driver.firstname = firstname;
    if (lastname) driver.lastname = lastname;
    if (dob) driver.dob = dob;
    if (gender) driver.gender = gender;
    if (ride_no_days) driver.ride_no_days = ride_no_days;
    if (req.files && req.files.profilePhoto) {
      driver.profilePhoto = req.files.profilePhoto[0].location;
    }
    // Save the driver document
    await driver.save();

    // Populate the updated driver document
    const populatedDriver = await Driver.findById(driver_id)
      .populate("documents.driver_pancard")
      .populate("documents.driver_aadharcard")
      .populate("documents.driver_registrationCertificate")
      .populate("documents.driver_location")
      .populate("documents.driver_service")
      .populate("documents.driver_dl")
      .lean();

    // Return driver information including populated documents
    res.status(200).json({
      status: true,
      status_code: 200,
      message: "Driver Profile updated successfully.",
      driver: populatedDriver,
    });
  } catch (error) {
    console.error("Error updating driver details:", error);
    res.status(500).json({
      status: false,
      status_code: 500,
      error: error.message,
      message: "Failed to update driver details. Please try again later.",
    });
  }
};

// Driver Duty Enable/Disable
exports.UpdateDriversDuty = async (req, res) => {
  try {
    const { driver_id, on_duty_flag } = req.body;

    // Validate driver_id presence
    if (!driver_id) {
      return res.status(400).json({
        status: false,
        status_code: 400,
        message: "Driver ID is required",
      });
    }

    if (!on_duty_flag) {
      return res.status(400).json({
        status: false,
        status_code: 400,
        message: "Driver Duty Status is required",
      });
    }

    // Get Driver Information with proper population
    let driver = await Driver.findById(driver_id)
      .populate("documents.driver_pancard")
      .populate("documents.driver_aadharcard")
      .populate("documents.driver_registrationCertificate")
      .populate("documents.driver_location")
      .populate("documents.driver_dl")
      .populate("documents.driver_service");

    if (!driver) {
      return res.status(404).json({
        status: false,
        status_code: 404,
        message: "Driver not found.",
      });
    }

    // Update driver fields if provided
    if (on_duty_flag) driver.on_duty_flag = on_duty_flag;
    // Save the driver document
    await driver.save();

    // Populate the updated driver document
    const populatedDriver = await Driver.findById(driver_id)
      .populate("documents.driver_pancard")
      .populate("documents.driver_aadharcard")
      .populate("documents.driver_registrationCertificate")
      .populate("documents.driver_location")
      .populate("documents.driver_service")
      .populate("documents.driver_dl")
      .lean();

    // Return driver information including populated documents
    res.status(200).json({
      status: true,
      status_code: 200,
      message: "Driver Duty updated successfully.",
      driver: populatedDriver,
    });
  } catch (error) {
    console.error("Error updating driver details:", error);
    res.status(500).json({
      status: false,
      status_code: 500,
      error: error.message,
      message: "Failed to update driver details. Please try again later.",
    });
  }
};

exports.UpdateLocation = async (req, res) => {
  const { driver_id, location } = req.body;
  try {
    const updatedLocation = await updateDriverLocation(driver_id, location);
    if (!updatedLocation) {
      return res.status(400).json({ error: "Failed to update location" });
    }
    res.json(updatedLocation);
  } catch (error) {
    console.error("Error updating location:", error);
    res.status(500).json({ error: "Error updating location" });
  }
};

exports.getCurrentLocationByID = async (req, res) => {
  try {
    const { driver_id } = req.params;
    let driver = await Driver.findById(driver_id);
    if (!driver) {
      return res.status(404).json({
        status: false,
        status_code: 404,
        message: "Driver not found.",
      });
    }
    const CurrentLocation = await DriverCurrentLocation.findOne({
      driver: driver_id,
    });

    if (!CurrentLocation) {
      return res.status(404).json({
        status: false,
        status_code: 404,
        message: "Current Location not found",
      });
    }

    res.status(200).json({
      status: true,
      status_code: 200,
      CurrentLocation: CurrentLocation,
    });
  } catch (error) {
    console.error("Error fetching CurrentLocation:", error);
    res.status(500).json({
      status: false,
      status_code: 500,
      error: error.message,
      message: "Failed to fetch CurrentLocation. Please try again later.",
    });
  }
};
