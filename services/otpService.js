const twilio = require("twilio");
const Driver = require("../models/Driver");
const {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_PHONE_NUMBER,
} = require("../utils/constants");

const client = new twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

exports.sendOtp = async (phone, android_device_token) => {
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  const driver = await Driver.findOne({ phone });
  if (driver) {
    if (driver.admin_status === 0) {
      // Active
      await Driver.updateOne(
        { phone },
        { android_device_token },
        { otp },
        { upsert: true }
      );
      await client.messages.create({
        body: `Your Seda verification code is ${otp}`,
        from: TWILIO_PHONE_NUMBER,
        to: phone,
      });
      return otp;
    } else if (driver.admin_status === 1) {
      // Inactive
      await client.messages.create({
        body: `Your account is currently on hold. Please contact support.`,
        from: TWILIO_PHONE_NUMBER,
        to: phone,
      });
      return "Account is on hold";
    } else {
      // Handle any other unexpected admin_status values or error cases
      throw new Error("Unexpected admin_status value");
    }
  } else {
    await Driver.create({ phone, android_device_token, otp, admin_status: 0 }); // Assuming new drivers are active by default
    await client.messages.create({
      body: `Your Seda verification code is ${otp}`,
      from: TWILIO_PHONE_NUMBER,
      to: phone,
    });
    return otp;
  }
};

exports.verifyOtp = async (phone, otp, language) => {
  const driver = await Driver.findOne({ phone, otp });
  if (!driver) throw new Error("Invalid OTP");
  driver.verified = true;
  driver.admin_status = 1;
  driver.language = language;
  driver.otp = null;
  await driver.save();
  return driver;
};
