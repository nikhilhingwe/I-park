const Verification = require("../models/verification.model");
const SuperAdmin = require("../models/superAdmin.model");
const Hotel = require("../models/hotel.model");
const Branch = require("../models/branch.model");
const BranchGroup = require("../models/branchGroup.model");
const ValleyBoy = require("../models/valleyboy.model");
const jwt = require("jsonwebtoken");
const { comparePassword } = require("../utils/crypto");
const User = require("../models/user.model");
const { generateOTP } = require("../utils/helper");

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  let user;
  let userModel = null;

  if (!email || !password) {
    return res.status(400).json({ message: "Please enter valid details" });
  }

  try {
    // Find user in various collections
    user = await SuperAdmin.findOne({ email }).lean();
    if (user) userModel = "SuperAdmin";
    if (!user) {
      user = await Hotel.findOne({ email }).lean();
      if (user) userModel = "Hotel";
    }
    if (!user) {
      user = await Branch.findOne({ email })
        .populate("hotelId", "email")
        .lean();
      if (user) userModel = "Branch";
    }
    if (!user) {
      user = await BranchGroup.findOne({ email })
        .populate("assignedBranchsId", "email")
        .populate("hotelId", "email")
        .lean();
      if (user) userModel = "BranchGroup";
    }
    if (!user) {
      user = await ValleyBoy.findOne({ email })
        .populate("hotelId branchId")
        .lean();
      if (user) userModel = "ValleyBoy";
    }

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Incorrect password or email ID" });
    }

    let payload = {
      id: user._id,
      email: user.email,
      role: user.role,
    };

    if (userModel === "ValleyBoy") {
      payload = {
        id: user._id,
        email: user.email,
        hotelId: user.hotelId?._id || user.hotelId,
        branchId: user.branchId?._id || user.branchId,
        role: user.role,
      };
    } else {
      // Other user types
      if (user.hotelId) payload.hotelId = user.hotelId;
      if (user.branchId) payload.branchId = user.branchId;
      if (user.assignedBranchsId)
        payload.assignedBranchsId = user.assignedBranchsId;
    }

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    const expireAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await Verification.create({
      userId: user._id,
      userModel,
      token,
      expireAt,
    });

    res.status(200).json({
      message: "Successful Login",
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.logoutUser = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.status(400).json({ message: "No token provided" });

    const deleted = await Verification.findOneAndDelete({ token });
    if (!deleted) {
      return res
        .status(404)
        .json({ message: "Token not found or already deleted" });
    }
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ----------------------------------------------------------------

async function sendWhatsAppTemplateMessage(recipientNumber, otp) {
  try {
    const formattedNumber = recipientNumber.replace(/\D/g, "");

    // const verificationLink = `https://yourapp.com/verify-otp?phone=${formattedNumber}&otp=${otp}`;

    const body = new URLSearchParams({
      apikey: process.env.API_KEY_WABA,
      userid: process.env.WABA_USER,
      password: process.env.WABA_PASSWORD,
      wabaNumber: "918237329243",
      msg: `Your iPark OTP is ${otp}. It will expire in 5 minutes.`,
      output: "json",
      mobile: `91${formattedNumber}`,
      sendMethod: "quick",
      msgType: "text",
      templatename: "ipark",
    });

    const response = await fetch("https://theultimate.io/WAApi/send", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    const text = await response.text();
    try {
      const data = JSON.parse(text);
      console.log("Template Message Response:", data);
    } catch {
      console.error("Server returned non-JSON response:", text);
    }
  } catch (err) {
    console.error("Error sending template message:", err.message);
  }
}

exports.sendOtp = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber || !/^[0-9]{10}$/.test(phoneNumber)) {
      return res.status(400).json({ message: "Invalid phone number" });
    }

    // Check if user exists, else create
    let user = await User.findOne({ phoneNumber });
    if (!user) {
      user = await User.create({ phoneNumber });
    }

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 min expiry

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // ✅ Call WhatsApp function with phoneNumber & otp
    await sendWhatsAppTemplateMessage(phoneNumber, otp);

    console.log(`🔐 OTP for ${phoneNumber}: ${otp}`);

    res.status(200).json({
      message: "OTP generated and sent via WhatsApp successfully",
      phoneNumber,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// -----------------------------------------------

exports.verifyOtpLogin = async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;

    if (!phoneNumber || !otp) {
      return res.status(400).json({ message: "Phone number and OTP required" });
    }

    const user = await User.findOne({ phoneNumber });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Check OTP validity
    if (user.otp !== otp || user.otpExpires < new Date()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // ✅ OTP verified, clear otp fields
    user.otp = null;
    user.otpExpires = null;
    user.isVerified = true;
    await user.save();

    // 🔐 Create token
    const payload = {
      id: user._id,
      phoneNumber: user.phoneNumber,
      role: user.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // Store token
    const expireAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await Verification.create({
      userId: user._id,
      userModel: "User",
      token,
      expireAt,
    });

    res.status(200).json({
      message: "Login successful",
      token,
      // user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
