const express = require("express");
const {
  loginUser,
  logoutUser,
  sendOtp,
  verifyOtpLogin,
} = require("../controllers/user.controller");

const router = express.Router();

router.post("/login", loginUser);

router.post("/logout", logoutUser);

router.post("/send-otp", sendOtp);

router.post("/verify-otp", verifyOtpLogin);

module.exports = router;
