const findSameUsername = require("../utils/usernameUniqueCheck");
const ValleyBoy = require("../models/valleyboy.model");
const { encrypt } = require("../utils/crypto");
const mongoose = require("mongoose");
const { decrypt } = require("../utils/crypto");
const QRCode = require("qrcode");

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
//   const { id } = req.params; // optional

//   try {
//     let valleyBoys;

//     if (id) {
//       // Single ValleyBoy by ID
//       const singleValleyBoy = await ValleyBoy.findById(id)
//         .populate("hotelId", "name")
//         .populate("branchId", "name")
//         .populate("branchGroupId", "username");

//       if (!singleValleyBoy) {
//         return res.status(404).json({ message: "ValleyBoy not found" });
//       }

//       valleyBoys = [singleValleyBoy];
//     } else {
//       // All online ValleyBoys
//       valleyBoys = await ValleyBoy.find({ isOnline: true })
//         .populate("hotelId", "name")
//         .populate("branchId", "name")
//         .populate("branchGroupId", "username");

//       if (!valleyBoys.length) {
//         return res.status(404).json({ message: "No online ValleyBoys found" });
//       }
//     }

//     const qrCodes = [];

//     for (const valleyBoy of valleyBoys) {
//       const qrData = {
//         id: valleyBoy._id,
//         name: valleyBoy.name,
//         email: valleyBoy.email,
//         phone: valleyBoy.phone,
//         username: valleyBoy.username,
//         hotel: valleyBoy.hotelId?.name,
//         branch: valleyBoy.branchId?.name,
//         branchGroup: valleyBoy.branchGroupId?.username || null,
//         isOnline: valleyBoy.isOnline,
//       };

//       const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData));

//       qrCodes.push({
//         valleyBoyId: valleyBoy._id,
//         name: valleyBoy.name,
//         qrCode: qrCodeDataURL,
//       });
//     }

//     res.status(200).json({
//       message: id
//         ? "QR code generated for ValleyBoy"
//         : "QR codes generated for all online ValleyBoys",
//       qrCodes,
//     });
//   } catch (err) {
//     console.error("Error generating QR codes:", err);
//     res.status(500).json({ message: err.message });
//   }
// };

exports.generateValleyBoyQR = async (req, res) => {
  const { id } = req.params; // optional

  try {
    let valleyBoys;

    if (id) {
      // Single ValleyBoy by ID
      const singleValleyBoy = await ValleyBoy.findById(id)
        .populate("hotelId", "name")
        .populate("branchId", "name")
        .populate("branchGroupId", "username");

      if (!singleValleyBoy) {
        return res.status(404).json({ message: "ValleyBoy not found" });
      }

      valleyBoys = [singleValleyBoy];
    } else {
      // All online ValleyBoys
      valleyBoys = await ValleyBoy.find({ isOnline: true })
        .populate("hotelId", "name")
        .populate("branchId", "name")
        .populate("branchGroupId", "username");

      if (!valleyBoys.length) {
        return res.status(404).json({ message: "No online ValleyBoys found" });
      }
    }

    const qrCodes = [];

    for (const valleyBoy of valleyBoys) {
      // Instead of JSON, encode a frontend URL for redirection
      const qrUrl = `https://yourfrontend.com/valleyBoyForm?id=${valleyBoy._id}`;

      const qrCodeDataURL = await QRCode.toDataURL(qrUrl);

      qrCodes.push({
        valleyBoyId: valleyBoy._id,
        name: valleyBoy.name,
        qrCode: qrCodeDataURL,
      });
    }

    res.status(200).json({
      message: id
        ? "QR code generated for ValleyBoy"
        : "QR codes generated for all online ValleyBoys",
      qrCodes,
    });
  } catch (err) {
    console.error("Error generating QR codes:", err);
    res.status(500).json({ message: err.message });
  }
};
