const BranchGroup = require("../models/branchGroup.model");
const { encrypt } = require("../utils/crypto");
const findSameUsername = require("../utils/usernameUniqueCheck");


exports.addBranchGroup = async (req, res) => {
  try {
    const { userName, email, password, address, phone, hotelId } = req.body;

    if (!userName || !email || !password || !hotelId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existingUserByUsername = await findSameUsername(email);
    if (existingUserByUsername.exists) {
      return res.status(400).json({ message: "This email already exists" });
    }
    const newBranchGroup = new BranchGroup({
      userName,
      email,
      password:encrypt(password), 
      address,
      phone,
      hotelId,
    });

    await newBranchGroup.save();
    res.status(201).json({ message: "BranchGroup created successfully", data: newBranchGroup });

  } catch (error) {
    console.error("Error creating BranchGroup:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


