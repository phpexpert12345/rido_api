const express = require("express");
const {
  sendOtp,
  verifyOtp,
  getDriverDetails,
  UpdateDrivers,
  UploadDLDocument,
  UploadPancardDocument,
  UploadAadharcardDocument,
  UploadDriverRCDocument,
  UpdateDriversProfileInfo,
  UpdateDriversDuty,
  UpdateLocation,
  getCurrentLocationByID,
} = require("../controllers/driverController");

const router = express.Router();
/* const { upload } = require("../services/diskStorageService"); */
const { upload } = require("../services/UploadAWS3Bucket");
router.post("/sendOtp", sendOtp);
router.post("/verifyOtp", verifyOtp);
router.get("/driver/:driver_id", getDriverDetails);
router.post("/updatedriver", UpdateDrivers);
router.post("/updatedriver-duty", UpdateDriversDuty);
router.post(
  "/drivers/uploadDL",
  upload.fields([
    { name: "frontImage", maxCount: 1 },
    { name: "backImage", maxCount: 1 },
  ]),
  UploadDLDocument
);

router.post(
  "/drivers/uploadPancard",
  upload.fields([
    { name: "frontImage", maxCount: 1 },
    { name: "backImage", maxCount: 1 },
  ]),
  UploadPancardDocument
);

router.post(
  "/drivers/uploadAadharcard",
  upload.fields([
    { name: "frontImage", maxCount: 1 },
    { name: "backImage", maxCount: 1 },
  ]),
  UploadAadharcardDocument
);

router.post(
  "/drivers/uploadRC",
  upload.fields([
    { name: "frontImage", maxCount: 1 },
    { name: "backImage", maxCount: 1 },
  ]),
  UploadDriverRCDocument
);

router.post(
  "/drivers/update-profile-info",
  upload.fields([{ name: "profilePhoto", maxCount: 1 }]),
  UpdateDriversProfileInfo
);

router.post("/update-driver-location", UpdateLocation);
router.get("/driver-current-location/:driver_id", getCurrentLocationByID);
module.exports = router;
