const findSameUsername = require("../utils/usernameUniqueCheck");
const ValleyBoy = require("../models/valleyboy.model");
const { encrypt } = require("../utils/crypto");
const mongoose = require("mongoose");
const { decrypt } = require("../utils/crypto");
const QRCode = require("qrcode");

const Hotel = require("../models/hotel.model");
const Branch = require("../models/branch.model");

exports.addValleyBoy = async (req, res) => {
  const {
    name,
    email,
    phone,
    username,
    password,
    profileImage,
    hotelId,
    branchGroupId,
    branchId,
    isOnline = true,
  } = req.body;

  try {
    const existingUserByUsername = await findSameUsername(email);

    if (existingUserByUsername.exists) {
      return res.status(400).json({ message: "Username already exists" });
    }

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }

    // Encrypt the password
    const encryptedPassword = encrypt(password);

    const newValleyBoy = new ValleyBoy({
      name,
      email,
      phone,
      username,
      password: encryptedPassword,
      profileImage,
      hotelId,
      branchGroupId,
      branchId,
      role: 5,
      isOnline,
    });

    await newValleyBoy.save();

    res.status(201).json({
      message: "ValleyBoy added successfully",
      valleyBoy: newValleyBoy,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getValleyBoy = async (req, res) => {
  const { role, id, assignedBranchsId } = req.user;
  const ObjectId = mongoose.Types.ObjectId;
  let valleyBoys;
  console.log("aaaaaaaaaaaaaaaaaa", req.user);
  console.log("aaaaaaaaaaaaaaaaaa", assignedBranchsId);

  try {
    if (role === "superadmin") {
      valleyBoys = await ValleyBoy.find()
        .populate("hotelId", "name")
        .populate("branchId", "name");
    } else if (role === "hotel") {
      valleyBoys = await ValleyBoy.find({ hotelId: new ObjectId(id) })
        .populate("hotelId", "name")
        .populate("branchId", "name");
    } else if (role === "branch") {
      valleyBoys = await ValleyBoy.find({ branchId: new ObjectId(id) })
        .populate("branchId", "name")
        .populate("hotelId", "name");
    } else if (role === "branchGroup") {
      valleyBoys = await ValleyBoy.find({
        branchId: { $in: assignedBranchsId },
      })
        .populate("branchId", "name")
        .populate("hotelId", "name");
    }
    valleyBoys?.forEach((valleyBoy) => {
      const decryptedPassword = decrypt(valleyBoy.password);
      valleyBoy.password = decryptedPassword;
    });

    if (!valleyBoys || valleyBoys.length === 0) {
      return res.status(404).json({ message: "Valley boys not found" });
    }

    res.status(200).json(valleyBoys);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateValleyBoy = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    email,
    phone,
    username,
    password,
    hotelId,
    branchGroupId,
    branchId,
    isOnline = true,
  } = req.body;

  try {
    const valleyBoy = await ValleyBoy.findById(id);
    if (!valleyBoy) {
      return res.status(404).json({ message: "ValleyBoy not found" });
    }

    if (username && username !== valleyBoy.username) {
      const { exists } = await findSameUsername(username);
      if (exists) {
        return res.status(400).json({ message: "Username already exists" });
      }
    }

    if (email && email !== valleyBoy.email) {
      const existingEmail = await ValleyBoy.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
    }

    const updateData = {
      ...(name && { name }),
      ...(email && { email }),
      ...(phone && { phone }),
      ...(username && { username }),
      ...(hotelId && { hotelId }),
      ...(branchGroupId && { branchGroupId }),
      ...(branchId && { branchId }),
      ...(isOnline && { isOnline }),
    };

    if (password) {
      updateData.password = await encrypt(password);
    }

    const updatedValleyBoy = await ValleyBoy.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    res.status(200).json({
      message: "ValleyBoy updated successfully",
      valleyBoy: updatedValleyBoy,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteValleyBoy = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedValleyBoy = await ValleyBoy.findByIdAndDelete(id);

    if (!deletedValleyBoy) {
      return res.status(404).json({ message: "ValleyBoy not found" });
    }

    res.status(200).json({
      message: "ValleyBoy deleted successfully",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.toggleValleyBoyStatus = async (req, res) => {
  const { id } = req.params;
  const { isOnline } = req.body; // boolean: true or false

  if (typeof isOnline !== "boolean") {
    return res.status(400).json({ message: "isOnline must be boolean" });
  }

  try {
    const valleyBoy = await ValleyBoy.findByIdAndUpdate(
      id,
      { isOnline },
      { new: true }
    );

    if (!valleyBoy) {
      return res.status(404).json({ message: "ValleyBoy not found" });
    }

    res.status(200).json({
      message: `ValleyBoy is now ${isOnline ? "online" : "offline"}`,
      valleyBoy,
    });
  } catch (err) {
    console.error("Error toggling status:", err);
    res.status(500).json({ message: err.message });
  }
};

// ------------------------------------------------

// exports.generateValleyBoyQR = async (req, res) => {
//   const { id } = req.params; // optional: single ValleyBoy
//   const { role, id: userId, hotelId, branchId, branchGroupId } = req.user;

//   console.log("Valle boy QR", userId, hotelId);

//   try {
//     const query = { isOnline: true }; // only online ValleyBoys

//     // Role-based filtering
//     switch (role) {
//       case "superadmin":
//         // No filter
//         break;

//       case "hotel":
//         if (!hotelId)
//           return res.status(400).json({ message: "Hotel ID missing" });
//         query.hotelId = hotelId;
//         break;

//       case "branch":
//         if (!branchId)
//           return res.status(400).json({ message: "Branch ID missing" });
//         query.branchId = branchId;
//         break;

//       case "branchGroup":
//         if (!branchGroupId)
//           return res.status(400).json({ message: "BranchGroup ID missing" });
//         query.branchGroupId = branchGroupId;
//         break;

//       default:
//         return res.status(403).json({ message: "Unauthorized role" });
//     }

//     // If a specific ValleyBoy ID is provided, filter by it
//     if (id) query._id = id;

//     // Fetch ValleyBoys based on the query
//     let valleyBoys = await ValleyBoy.find(query)
//       .populate("hotelId", "name email")
//       .populate("branchId", "name email")
//       .populate("branchGroupId", "username")
//       .lean(); // convert to plain JS objects

//     if (!valleyBoys.length) {
//       return res.status(404).json({ message: "No ValleyBoys found" });
//     }

//     // Generate QR codes and include hotel/branch info
//     const qrCodes = await Promise.all(
//       valleyBoys.map(async (vb) => {
//         const qrUrl = `https://yourfrontend.com/valleyBoyForm?id=${vb._id}`;
//         const qrCodeDataURL = await QRCode.toDataURL(qrUrl);

//         return {
//           valleyBoyId: vb._id,
//           name: vb.name,
//           hotel: vb.hotelId || null,
//           branch: vb.branchId || null,
//           qrCode: qrCodeDataURL,
//         };
//       })
//     );

//     res.status(200).json({
//       message: id
//         ? "QR code generated for ValleyBoy"
//         : "QR codes generated for all online ValleyBoys within your role scope",
//       qrCodes,
//     });
//   } catch (err) {
//     console.error("Error generating QR codes:", err);
//     res.status(500).json({ message: err.message });
//   }
// };

exports.generateValleyBoyQR = async (req, res) => {
  const { id } = req.params; // optional single ValleyBoy
  const { role, id: userId, hotelId, branchId, assignedBranchsId } = req.user;

  try {
    // Base query: only online ValleyBoys
    const query = { isOnline: true };

    // Role-based filtering
    switch (role) {
      case "superadmin":
        // No filter, get all ValleyBoys
        break;

      case "hotel":
        if (!hotelId)
          return res.status(400).json({ message: "Hotel ID missing" });
        query.hotelId = hotelId;
        break;

      case "branch":
        if (!branchId)
          return res.status(400).json({ message: "Branch ID missing" });
        query.branchId = branchId;
        break;

      case "branchGroup":
        if (!assignedBranchsId || !assignedBranchsId.length)
          return res
            .status(400)
            .json({ message: "BranchGroup assigned branches missing" });
        query.branchId = { $in: assignedBranchsId };
        break;

      default:
        return res.status(403).json({ message: "Unauthorized role" });
    }

    // If a specific ValleyBoy ID is provided, filter by it
    if (id) query._id = id;

    // Fetch ValleyBoys with hotel and branch info
    const valleyBoys = await ValleyBoy.find(query)
      .populate("hotelId", "name email")
      .populate("branchId", "name email")
      .lean();

    if (!valleyBoys.length) {
      return res.status(404).json({ message: "No ValleyBoys found" });
    }

    // Generate QR codes with hotel and branch info
    const qrCodes = await Promise.all(
      valleyBoys.map(async (vb) => {
        // Generate QR link for ValleyBoy form
        const qrUrl = `https://yourfrontend.com/valleyBoyForm?id=${vb._id}`;
        const qrCodeDataURL = await QRCode.toDataURL(qrUrl);

        return {
          valleyBoyId: vb._id,
          name: vb.name,
          hotel: vb.hotelId || null,
          branch: vb.branchId || null,
          qrCode: qrCodeDataURL,
        };
      })
    );

    res.status(200).json({
      message: id
        ? "QR code generated for ValleyBoy"
        : "QR codes generated for all online ValleyBoys within your role scope",
      qrCodes,
    });
  } catch (err) {
    console.error("Error generating ValleyBoy QR codes:", err);
    res.status(500).json({ message: err.message });
  }
};
