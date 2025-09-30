const SuperAdmin = require("../models/superAdmin.model");
const { encrypt, decrypt } = require("../utils/crypto");

// 🔐 Register SuperAdmin
exports.registerSuperAdmin = async (req, res) => {
  const { name, username, email, password, phone } = req.body;

  try {
    // Check if SuperAdmin already exists
    const superAdminExists = await SuperAdmin.findOne({ email });

    if (superAdminExists) {
      return res.status(400).json({
        success: false,
        message: "SuperAdmin with this E-mail already exists",
      });
    }

    // Encrypt the password
    const encryptedPassword = encrypt(password);

    // Create and save new SuperAdmin
    const newSuperAdmin = new SuperAdmin({
      name,
      username,
      email,
      password: encryptedPassword, // Save encrypted password
      phone,
    });

    await newSuperAdmin.save();

    // Return success response (excluding password)
    res.status(201).json({
      success: true,
      message: "SuperAdmin registered successfully",
      data: newSuperAdmin,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error, please try again later",
    });
  }
};

// 🔐 Login SuperAdmin
exports.loginSuperAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const superAdmin = await SuperAdmin.findOne({ email });
    if (!superAdmin) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials (email)",
      });
    }

    const decryptedPassword = decrypt(superAdmin.password);

    if (decryptedPassword !== password) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials (password)",
      });
    }

    const token = generateToken(superAdmin._id); // Generate JWT

    res.status(200).json({
      success: true,
      message: "Login successful",
      token, // 🪙 Send JWT to client
      data: {
        id: superAdmin._id,
        name: superAdmin.name,
        username: superAdmin.username,
        email: superAdmin.email,
        phone: superAdmin.phone,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};
