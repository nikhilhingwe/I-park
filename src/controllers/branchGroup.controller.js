const BranchGroup = require("../models/branchGroup.model");
const { encrypt, decrypt } = require("../utils/crypto");
const findSameUsername = require("../utils/usernameUniqueCheck");

exports.addBranchGroup = async (req, res) => {
  try {
    const {
      userName,
      email,
      password,
      address,
      phone,
      hotelId,
      assignedBranchsId,
    } = req.body;

    console.log(
      userName,
      email,
      password,
      address,
      phone,
      hotelId,
      assignedBranchsId
    );

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
      password: encrypt(password),
      address,
      phone,
      hotelId,
      assignedBranchsId,
    });

    await newBranchGroup.save();
    res
      .status(201)
      .json({
        message: "BranchGroup created successfully",
        data: newBranchGroup,
      });
  } catch (error) {
    console.error("Error creating BranchGroup:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getBranchGroups = async (req, res) => {
  try {
    const { role, id } = req.user;

    let query = {};

    if (role === "superadmin") {
      query = {};
    } else if (role === "hotel") {
      if (!id) {
        return res
          .status(400)
          .json({ message: "Hotel ID not found in user data" });
      }
      query = { hotelId: id };
    } else {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    const branchGroups = await BranchGroup.find(query)
      .populate("assignedBranchsId", "name email address phone")
      .populate("hotelId", "name email address phone")
      .lean();

    res.status(200).json({
      message: "BranchGroups retrieved successfully",
      data: branchGroups.map((bg) => {
        return {
          ...bg,
          password: decrypt(bg.password),
        };
      }),
    });
  } catch (error) {
    console.error("Error retrieving BranchGroups:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateBranchGroup = async (req, res) => {
  const { id } = req.params;
  const { name, email, password, phone, assignedBranchsId, branchGroupId } =
    req.body;

  try {
    const user = await BranchGroup.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (email && email !== user.email) {
      const existingUser = await findSameUsername(email);
      if (existingUser.exists) {
        return res.status(400).json({ message: "This email already exists" });
      }
      user.email = email;
    }

    if (branchGroupId && branchGroupId !== String(user.branchGroupId)) {
      const group = await BranchGroup.findById(branchGroupId);
      if (!group) {
        return res.status(404).json({ message: "Branch Group not found" });
      }
      user.branchGroupId = branchGroupId;
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (assignedBranchsId) user.assignedBranchsId = assignedBranchsId;

    if (password) {
      const encryptedPassword = encrypt(password);
      user.password = encryptedPassword;
    }

    await user.save();

    res.status(200).json({ message: "User updated successfully", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteBranchGroup = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedBranchGroup = await BranchGroup.findByIdAndDelete(id);

    if (!deletedBranchGroup) {
      return res.status(404).json({ message: "BranchGroup not found" });
    }

    res.status(200).json({
      message: "BranchGroup deleted successfully",
      data: deletedBranchGroup,
    });
  } catch (error) {
    console.error("Error deleting BranchGroup:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
