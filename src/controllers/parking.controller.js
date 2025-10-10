const mongoose = require("mongoose");
const Parking = require("../models/parking.model");
const ValleyBoy = require("../models/valleyboy.model");
const Hotel = require("../models/hotel.model");
const Branch = require("../models/branch.model");
const { default: axios } = require("axios");
const User = require("../models/user.model");

const toObjectId = (value) => {
  if (mongoose.Types.ObjectId.isValid(value))
    return new mongoose.Types.ObjectId(value);
  return null;
};

exports.updateParkingStatusOnly = async (req, res) => {
  try {
    const { status, latitude, longitude } = req.body;

    const updateData = { status };

    if (latitude !== undefined && longitude !== undefined) {
      updateData.location = {
        type: "Point",
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      };
    }

    const parking = await Parking.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    if (!parking) return res.status(404).json({ error: "Parking not found" });

    res.status(200).json(parking);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

async function sendWhatsAppTemplateMessage(
  recipientNumber,
  vehicleNumber,
  userName,
  valleyBoyName,
  parkingId
) {
  try {
    const formattedNumber = recipientNumber.replace(/\D/g, "");

    const body = new URLSearchParams({
      apikey: process.env.API_KEY_WABA,
      userid: process.env.WABA_USER,
      password: process.env.WABA_PASSWORD,
      wabaNumber: "918237329243",
      msg: `Hello ${userName}, your vehicle (${vehicleNumber}) is now parking. Valley Boy: ${valleyBoyName}. Reply with ID: ${parkingId} for updates.`,
      output: "json",
      mobile: formattedNumber,
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

exports.updateParkingStatusOnly = async (req, res) => {
  try {
    const { status, latitude, longitude } = req.body;
    let { parkingTime } = req.body;
    if (!parkingTime) parkingTime = new Date();

    // Generate unique ID for this parking
    const parkingId = req.body.parkingId || require("uuid").v4();

    const updateData = { status, parkingTime, isParked: true, parkingId };

    if (latitude !== undefined && longitude !== undefined) {
      updateData.location = {
        type: "Point",
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      };
    }

    const parking = await Parking.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    if (!parking) return res.status(404).json({ error: "Parking not found" });

    // If status is accepted, send WhatsApp message
    if (status === "accepted") {
      const valleyBoy = await ValleyBoy.findById(parking.valleyBoyId);
      await sendWhatsAppTemplateMessage(
        parking.userNumber,
        parking.vehicleNumber,
        parking.userName,
        valleyBoy?.name || "Valley Boy",
        parking.parkingId
      );
    }

    res.status(200).json(parking);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

exports.updateIsParked = async (req, res) => {
  try {
    const { isParked } = req.body;
    const parking = await Parking.findByIdAndUpdate(
      req.params.id,
      { isParked },
      { new: true }
    );
    if (!parking) return res.status(404).json({ error: "Parking not found" });
    res.status(200).json(parking);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateParkingTime = async (req, res) => {
  try {
    let { parkingTime } = req.body;
    if (!parkingTime) parkingTime = new Date();
    const parking = await Parking.findByIdAndUpdate(
      req.params.id,
      { parkingTime, isParked: true },
      { new: true }
    );
    if (!parking) return res.status(404).json({ error: "Parking not found" });
    res.status(200).json(parking);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateUnparkingTime = async (req, res) => {
  try {
    let { unparkingTime } = req.body;
    if (!unparkingTime) unparkingTime = new Date();

    const parking = await Parking.findByIdAndUpdate(
      req.params.id,
      {
        unparkingTime,
        isParked: false,
        status: "completed",
      },
      { new: true }
    );

    if (!parking) {
      return res.status(404).json({ error: "Parking not found" });
    }

    res.status(200).json(parking);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateParkingStatus = async (req, res) => {
  try {
    const { isParked, unparkingTime } = req.body;
    let { parkingTime } = req.body;
    if (!parkingTime) parkingTime = new Date();
    const parking = await Parking.findByIdAndUpdate(
      req.params.id,
      { isParked, parkingTime, unparkingTime },
      { new: true }
    );
    if (!parking) return res.status(404).json({ error: "Parking not found" });
    res.status(200).json(parking);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.createParking = async (req, res) => {
  try {
    const {
      valleyBoyId,
      latitude,
      longitude,
      userName,
      userNumber,
      vehicleNumber,
      parkingLocation,
      hotelId,
      branchId,
    } = req.body;

    // ✅ 1. Validate required fields
    if (!vehicleNumber || !userName || !userNumber) {
      return res.status(400).json({
        message: "Vehicle number, user name, and user number are required",
      });
    }

    // 🧍 2. Check or create user
    let user = await User.findOne({ phoneNumber: userNumber });
    if (!user) {
      user = await User.create({
        name: userName,
        phoneNumber: userNumber,
      });
    }

    // 👷 3. Valley boy assignment logic
    let assignedValleyBoy = null;
    let status = "pending";

    if (valleyBoyId) {
      assignedValleyBoy = await ValleyBoy.findById(valleyBoyId);

      if (assignedValleyBoy) {
        if (assignedValleyBoy.isOnline) {
          // Use the given valley boy if online
          req.body.valleyBoyId = assignedValleyBoy._id;
          status = "accepted";
        } else {
          // If the given one is offline, try to assign another online valley boy
          const newValleyBoy = await ValleyBoy.findOne({ isOnline: true });
          if (newValleyBoy) {
            req.body.valleyBoyId = newValleyBoy._id;
            status = "accepted";
          } else {
            status = "pending";
          }
        }
      }
    }

    // 📍 4. Set parking location if coordinates are provided
    let location = undefined;
    if (latitude && longitude) {
      location = {
        type: "Point",
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      };
    }

    // 📝 5. Create parking data object
    const parkingData = {
      vehicleNumber,
      userName,
      userNumber,
      userId: user._id,
      valleyBoyId: req.body.valleyBoyId || null,
      status,
      hotelId,
      branchId,
      parkingLocation,
      location,
    };

    // 🚗 6. Save parking record
    const parking = await Parking.create(parkingData);

    res.status(201).json({
      success: true,
      message: "Parking created successfully",
      parking,
    });
  } catch (error) {
    console.error("Error creating parking:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getAllParking = async (req, res) => {
  try {
    const { role, id, hotelId, branchId, assignedBranchsId } = req.user;
    const query = {};

    // Normalize role
    const userRole = (role || "").toLowerCase();

    // Helper to safely convert to ObjectId
    const safeObjectId = (val) => {
      if (!val) return null;
      if (mongoose.Types.ObjectId.isValid(val)) {
        return typeof val === "string" ? new mongoose.Types.ObjectId(val) : val;
      }
      return null;
    };

    // Build query based on role
    switch (userRole) {
      case "superadmin":
        // No filter for superadmin
        break;

      case "hotel": {
        const targetHotelId = hotelId || id;
        if (!targetHotelId)
          return res.status(400).json({ message: "Hotel ID missing" });
        query.hotelId = safeObjectId(targetHotelId);
        break;
      }

      case "branch": {
        const targetBranchId = branchId || id;
        if (!targetBranchId)
          return res.status(400).json({ message: "Branch ID missing" });
        query.branchId = safeObjectId(targetBranchId);
        break;
      }

      case "valley":
      case "valleyboy":
        query.valleyBoyId = safeObjectId(id);
        break;

      case "branchgroup": {
        if (hotelId) query.hotelId = safeObjectId(hotelId);
        if (assignedBranchsId && assignedBranchsId.length) {
          const validIds = assignedBranchsId.map(safeObjectId).filter(Boolean);
          if (validIds.length) query.branchId = { $in: validIds };
        }
        break;
      }

      case "user":
        query.userId = safeObjectId(id);
        break;

      default:
        return res.status(403).json({ message: "Unauthorized role" });
    }

    console.log("USER:", req.user);
    console.log("QUERY:", query);

    // Fetch parking records
    let parkingList = await Parking.find(query)
      .populate("valleyBoyId", "name email phone role hotelId branchId")
      .populate("userId", "name email phone")
      .lean();

    // Populate hotel & branch info for valleyBoy
    parkingList = await Promise.all(
      parkingList.map(async (parking) => {
        if (parking.valleyBoyId) {
          if (parking.valleyBoyId.hotelId) {
            parking.valleyBoyId.hotel = await Hotel.findById(
              parking.valleyBoyId.hotelId,
              "name email"
            );
          }
          if (parking.valleyBoyId.branchId) {
            parking.valleyBoyId.branch = await Branch.findById(
              parking.valleyBoyId.branchId,
              "name email"
            );
          }
        }
        return parking;
      })
    );

    res.status(200).json(parkingList);
  } catch (error) {
    console.error("getAllParking error:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getParkingById = async (req, res) => {
  try {
    const { role, id: userId, hotelId, branchId } = req.user;
    const parkingId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(parkingId)) {
      return res.status(400).json({ error: "Invalid parking ID" });
    }

    let parking = await Parking.findById(parkingId)
      .populate("hotelId branchId valleyBoyId userId")
      .lean();

    if (!parking) return res.status(404).json({ error: "Parking not found" });

    // Role-based access check
    switch (role) {
      case "superadmin":
        // full access
        break;

      case "hotel":
        if (parking.hotelId?._id.toString() !== userId) {
          return res.status(403).json({ error: "Access denied" });
        }
        break;

      case "branch":
        if (parking.branchId?._id.toString() !== userId) {
          return res.status(403).json({ error: "Access denied" });
        }
        break;

      case "valley":
        if (parking.valleyBoyId?._id.toString() !== userId) {
          return res.status(403).json({ error: "Access denied" });
        }
        break;

      default:
        return res.status(403).json({ error: "Unauthorized role" });
    }

    res.status(200).json(parking);
  } catch (error) {
    console.error("getParkingById error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Update a parking record by ID
exports.updateParking = async (req, res) => {
  try {
    const parking = await Parking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!parking) return res.status(404).json({ error: "Parking not found" });
    res.status(200).json(parking);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a parking record by ID
exports.deleteParking = async (req, res) => {
  try {
    const parking = await Parking.findByIdAndDelete(req.params.id);
    if (!parking) return res.status(404).json({ error: "Parking not found" });
    res.status(200).json({ message: "Parking deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ---------------------------------------

exports.getParkingByLocation = async (req, res) => {
  try {
    const { role, id, hotelId, branchId, assignedBranchsId } = req.user;
    const query = {};

    const safeObjectId = (val) =>
      val && mongoose.Types.ObjectId.isValid(val)
        ? new mongoose.Types.ObjectId(val)
        : null;

    // Role-based filtering
    switch (role) {
      case "superadmin":
        break;
      case "hotel":
        query.hotelId = safeObjectId(hotelId || id);
        break;
      case "branch":
        query.branchId = safeObjectId(branchId || id);
        break;
      case "valley":
        query.valleyBoyId = safeObjectId(id);
        break;
      case "branchGroup":
        if (hotelId) query.hotelId = safeObjectId(hotelId);
        if (assignedBranchsId?.length) {
          query.branchId = {
            $in: assignedBranchsId.map(safeObjectId).filter(Boolean),
          };
        }
        break;
      default:
        return res.status(403).json({ message: "Unauthorized role" });
    }

    // Aggregate parking by coordinates
    let parkingByLocation = await Parking.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$location.coordinates",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          coordinates: "$_id",
          count: 1,
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Reverse geocoding
    const reverseGeocode = async ([lng, lat]) => {
      try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
        const response = await axios.get(url);
        return (
          response.data.address.city ||
          response.data.address.town ||
          response.data.address.state ||
          "Unknown"
        );
      } catch (err) {
        return "Unknown";
      }
    };

    parkingByLocation = await Promise.all(
      parkingByLocation.map(async (item) => ({
        ...item,
        locationName: await reverseGeocode(item.coordinates),
      }))
    );

    res.status(200).json(parkingByLocation);
  } catch (err) {
    console.error("getParkingByLocation error:", err);
    res.status(500).json({ error: err.message });
  }
};

// -----------------------------------------

exports.getParkingByLoc = async (req, res) => {
  try {
    const { lat, lng } = req.params;
    const { role, id, hotelId, branchId, assignedBranchsId } = req.user;

    if (!lat || !lng) {
      return res
        .status(400)
        .json({ message: "Latitude and longitude required" });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({ message: "Invalid latitude or longitude" });
    }

    // Base query for coordinates
    const query = {
      "location.coordinates": [longitude, latitude],
    };

    // Helper for safe ObjectId conversion
    const safeObjectId = (val) => {
      if (!val) return null;
      if (mongoose.Types.ObjectId.isValid(val)) {
        return typeof val === "string" ? new mongoose.Types.ObjectId(val) : val;
      }
      return null;
    };

    // Role-based filters
    switch (role) {
      case "superadmin":
        break;
      case "hotel":
        query.hotelId = safeObjectId(hotelId || id);
        break;
      case "branch":
        query.branchId = safeObjectId(branchId || id);
        break;
      case "valley":
        query.valleyBoyId = safeObjectId(id);
        break;
      case "branchGroup":
        if (hotelId) query.hotelId = safeObjectId(hotelId);
        if (assignedBranchsId?.length) {
          const validIds = assignedBranchsId.map(safeObjectId).filter(Boolean);
          if (validIds.length) query.branchId = { $in: validIds };
        }
        break;
      default:
        return res.status(403).json({ message: "Unauthorized role" });
    }

    console.log("QUERY:", query);

    let parkingList = await Parking.find(query)
      .populate("valleyBoyId", "name email phone role hotelId branchId")
      .populate("userId", "name email phone")
      .lean();

    // Fetch hotel and branch names
    parkingList = await Promise.all(
      parkingList.map(async (p) => {
        if (p.valleyBoyId?.hotelId) {
          const hotel = await Hotel.findById(p.valleyBoyId.hotelId, "name");
          p.valleyBoyId.hotel = hotel || null;
        }
        if (p.valleyBoyId?.branchId) {
          const branch = await Branch.findById(p.valleyBoyId.branchId, "name");
          p.valleyBoyId.branch = branch || null;
        }
        return p;
      })
    );

    res.status(200).json(parkingList);
  } catch (error) {
    console.error("getParkingByLoc error:", error);
    res.status(500).json({ error: error.message });
  }
};
