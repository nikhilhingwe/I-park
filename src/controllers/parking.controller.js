const mongoose = require("mongoose");
const Parking = require("../models/parking.model");
const ValleyBoy = require("../models/valleyboy.model");
const Hotel = require("../models/hotel.model");
const Branch = require("../models/branch.model");
const { default: axios } = require("axios");

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

exports.updateParkingStatusOnly = async (req, res) => {
  try {
    const { status, latitude, longitude } = req.body;
    let { parkingTime } = req.body;
    if (!parkingTime) parkingTime = new Date();

    const updateData = { status, parkingTime, isParked: true };

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
      const message = `Hello ${parking.userName}, your car (${parking.vehicleNumber}) is parked successfully.`;

      await sendWhatsAppMessage(parking.userNumber, message);
    }

    res.status(200).json(parking);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

// Function to send WhatsApp message using TheUltimate.io WA API
const sendWhatsAppMessage = async (mobileNumber, message) => {
  console.log(mobileNumber, message);
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

// exports.updateUnparkingTime = async (req, res) => {
//   try {
//     let { unparkingTime } = req.body;
//     if (!unparkingTime) unparkingTime = new Date();
//     const parking = await Parking.findByIdAndUpdate(
//       req.params.id,
//       { unparkingTime, isParked: false },
//       { new: true }
//     );
//     if (!parking) return res.status(404).json({ error: "Parking not found" });
//     res.status(200).json(parking);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };

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
    let { valleyBoyId, latitude, longitude } = req.body;
    let assignedValleyBoy = null;

    // Assign ValleyBoy if provided and online
    if (valleyBoyId) {
      assignedValleyBoy = await ValleyBoy.findById(valleyBoyId);
      if (assignedValleyBoy && !assignedValleyBoy.isOnline) {
        const newValleyBoy = await ValleyBoy.findOne({ isOnline: true });
        if (newValleyBoy) {
          req.body.valleyBoyId = newValleyBoy._id;
        } else {
          req.body.status = "pending";
        }
      }
    }

    if (latitude && longitude) {
      req.body.location = {
        type: "Point",
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      };
    }

    const parking = new Parking(req.body);
    await parking.save();

    res.status(201).json(parking);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getAllParking = async (req, res) => {
  try {
    const { role, id, hotelId, branchId, assignedBranchsId } = req.user;
    const query = {};

    // Improved safe ObjectId helper
    const safeObjectId = (val) => {
      if (!val) return null;
      if (mongoose.Types.ObjectId.isValid(val)) {
        return typeof val === "string" ? new mongoose.Types.ObjectId(val) : val;
      }
      return null;
    };

    switch (role) {
      case "superadmin":
        // no filter
        break;

      case "hotel": {
        const targetHotelId = hotelId || id; // fallback
        if (!targetHotelId) {
          return res.status(400).json({ message: "Hotel ID missing" });
        }
        query.hotelId = safeObjectId(targetHotelId);
        break;
      }

      case "branch": {
        const targetBranchId = branchId || id; // fallback
        if (!targetBranchId) {
          return res.status(400).json({ message: "Branch ID missing" });
        }
        query.branchId = safeObjectId(targetBranchId);
        break;
      }

      case "valley":
        query.valleyBoyId = safeObjectId(id);
        break;

      case "branchGroup": {
        if (hotelId) {
          query.hotelId = safeObjectId(hotelId);
        }
        if (assignedBranchsId && assignedBranchsId.length) {
          const validIds = assignedBranchsId.map(safeObjectId).filter(Boolean);
          if (validIds.length) {
            query.branchId = { $in: validIds };
          }
        }
        break;
      }

      default:
        return res.status(403).json({ message: "Unauthorized role" });
    }

    // Debug (remove in production)
    console.log("USER:", req.user);
    console.log("QUERY:", query);

    // Fetch parking records
    let parkingList = await Parking.find(query)
      .populate("valleyBoyId", "name email phone role hotelId branchId")
      .populate("userId", "name email phone")
      .lean();

    // Populate hotel & branch info
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

// exports.getParkingByLocation = async (req, res) => {
//   try {
//     const { role, id, hotelId, branchId, assignedBranchsId } = req.user;
//     const query = {};

//     const safeObjectId = (val) =>
//       val && mongoose.Types.ObjectId.isValid(val)
//         ? new mongoose.Types.ObjectId(val)
//         : null;

//     // Role-based filters
//     switch (role) {
//       case "superadmin":
//         break;
//       case "hotel":
//         query.hotelId = safeObjectId(hotelId || id);
//         break;
//       case "branch":
//         query.branchId = safeObjectId(branchId || id);
//         break;
//       case "valley":
//         query.valleyBoyId = safeObjectId(id);
//         break;
//       case "branchGroup":
//         if (hotelId) query.hotelId = safeObjectId(hotelId);
//         if (assignedBranchsId?.length) {
//           query.branchId = {
//             $in: assignedBranchsId.map(safeObjectId).filter(Boolean),
//           };
//         }
//         break;
//       default:
//         return res.status(403).json({ message: "Unauthorized role" });
//     }

//     // Aggregate parking by coordinates
//     let parkingByLocation = await Parking.aggregate([
//       { $match: query },
//       {
//         $group: {
//           _id: "$location.coordinates",
//           count: { $sum: 1 },
//         },
//       },
//       {
//         $project: {
//           _id: 0,
//           coordinates: "$_id",
//           count: 1,
//         },
//       },
//       { $sort: { count: -1 } },
//     ]);

//     // Reverse geocoding function using OpenStreetMap Nominatim
//     const reverseGeocode = async (coords) => {
//       try {
//         const [lng, lat] = coords;
//         const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
//         const response = await axios.get(url);
//         return (
//           response.data.address.city ||
//           response.data.address.town ||
//           response.data.address.state ||
//           "Unknown"
//         );
//       } catch (err) {
//         console.error("Reverse geocode error:", err);
//         return "Unknown";
//       }
//     };

//     // Map coordinates to city names
//     parkingByLocation = await Promise.all(
//       parkingByLocation.map(async (item) => {
//         const cityName = await reverseGeocode(item.coordinates);
//         return { ...item, locationName: cityName };
//       })
//     );

//     res.status(200).json(parkingByLocation);
//   } catch (err) {
//     console.error("getParkingByLocation error:", err);
//     res.status(500).json({ error: err.message });
//   }
// };

// exports.getParkingByLocation = async (req, res) => {
//   try {
//     const { role, id, hotelId, branchId, assignedBranchsId } = req.user;
//     const query = {};

//     // Safe ObjectId helper
//     const safeObjectId = (val) =>
//       val && mongoose.Types.ObjectId.isValid(val)
//         ? new mongoose.Types.ObjectId(val)
//         : null;

//     // Role-based filters
//     switch (role) {
//       case "superadmin":
//         break;
//       case "hotel":
//         query.hotelId = safeObjectId(hotelId || id);
//         break;
//       case "branch":
//         query.branchId = safeObjectId(branchId || id);
//         break;
//       case "valley":
//         query.valleyBoyId = safeObjectId(id);
//         break;
//       case "branchGroup":
//         if (hotelId) query.hotelId = safeObjectId(hotelId);
//         if (assignedBranchsId?.length) {
//           const validIds = assignedBranchsId.map(safeObjectId).filter(Boolean);
//           if (validIds.length) query.branchId = { $in: validIds };
//         }
//         break;
//       default:
//         return res.status(403).json({ message: "Unauthorized role" });
//     }

//     // Aggregate parking by coordinates
//     let parkingByLocation = await Parking.aggregate([
//       { $match: query },
//       {
//         $match: {
//           "location.coordinates.0": { $exists: true },
//           "location.coordinates.1": { $exists: true },
//         },
//       },
//       {
//         $group: {
//           _id: "$location.coordinates",
//           count: { $sum: 1 },
//         },
//       },
//       {
//         $project: {
//           _id: 0,
//           coordinates: "$_id",
//           count: 1,
//         },
//       },
//       { $sort: { count: -1 } },
//     ]);

//     // Reverse geocoding function using OpenStreetMap Nominatim
//     const reverseGeocode = async (coords) => {
//       try {
//         const [lng, lat] = coords;
//         const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
//         const response = await axios.get(url, {
//           headers: { "User-Agent": "ParkingApp/1.0" },
//         });
//         return (
//           response.data.address.city ||
//           response.data.address.town ||
//           response.data.address.state ||
//           "Unknown"
//         );
//       } catch (err) {
//         console.error("Reverse geocode error:", err.message);
//         return "Unknown";
//       }
//     };

//     // Map coordinates to location names
//     parkingByLocation = await Promise.all(
//       parkingByLocation.map(async (item) => {
//         const locationName = await reverseGeocode(item.coordinates);
//         return { ...item, locationName };
//       })
//     );

//     res.status(200).json(parkingByLocation);
//   } catch (err) {
//     console.error("getParkingByLocation error:", err);
//     res.status(500).json({ error: err.message });
//   }
// };

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

// const mongoose = require("mongoose");
// const Parking = require("../models/Parking");
// const Hotel = require("../models/Hotel");
// const Branch = require("../models/Branch")
// exports.getParkingByLoc = async (req, res) => {
//   try {
//     const { locationName } = req.params;
//     const { role, id, hotelId, branchId, assignedBranchsId } = req.user;

//     if (!locationName) {
//       return res.status(400).json({ message: "Location name is required" });
//     }

//     // Initial query filter by location name
//     const query = { parkingLocation: locationName };

//     // Helper for safe ObjectId conversion
//     const safeObjectId = (val) => {
//       if (!val) return null;
//       if (mongoose.Types.ObjectId.isValid(val)) {
//         return typeof val === "string" ? new mongoose.Types.ObjectId(val) : val;
//       }
//       return null;
//     };

//     // Role-based data restriction
//     switch (role) {
//       case "superadmin":
//         break;
//       case "hotel":
//         query.hotelId = safeObjectId(hotelId || id);
//         break;
//       case "branch":
//         query.branchId = safeObjectId(branchId || id);
//         break;
//       case "valley":
//         query.valleyBoyId = safeObjectId(id);
//         break;
//       case "branchGroup":
//         if (hotelId) query.hotelId = safeObjectId(hotelId);
//         if (assignedBranchsId?.length) {
//           const validIds = assignedBranchsId.map(safeObjectId).filter(Boolean);
//           if (validIds.length) query.branchId = { $in: validIds };
//         }
//         break;
//       default:
//         return res.status(403).json({ message: "Unauthorized role" });
//     }

//     // Fetch all parkings for this location
//     let parkingList = await Parking.find(query)
//       .populate("valleyBoyId", "name email phone role hotelId branchId")
//       .populate("userId", "name email phone")
//       .lean();

//     // Enrich with hotel/branch names
//     parkingList = await Promise.all(
//       parkingList.map(async (p) => {
//         if (p.valleyBoyId?.hotelId) {
//           p.valleyBoyId.hotel = await Hotel.findById(
//             p.valleyBoyId.hotelId,
//             "name email"
//           );
//         }
//         if (p.valleyBoyId?.branchId) {
//           p.valleyBoyId.branch = await Branch.findById(
//             p.valleyBoyId.branchId,
//             "name email"
//           );
//         }
//         return p;
//       })
//     );

//     res.status(200).json(parkingList);
//   } catch (error) {
//     console.error("getParkingByLocation error:", error);
//     res.status(500).json({ error: error.message });
//   }
// };

// exports.getParkingByLoc = async (req, res) => {
//   try {
//     const { lat, lng } = req.params;
//     const { role, id, hotelId, branchId, assignedBranchsId } = req.user;

//     if (!lat || !lng) {
//       return res
//         .status(400)
//         .json({ message: "Latitude and longitude required" });
//     }

//     const latitude = parseFloat(lat);
//     const longitude = parseFloat(lng);

//     if (isNaN(latitude) || isNaN(longitude)) {
//       return res.status(400).json({ message: "Invalid latitude or longitude" });
//     }

//     const query = {
//       "location.coordinates": [longitude, latitude],
//     };

//     // Helper
//     const safeObjectId = (val) => {
//       if (!val) return null;
//       if (mongoose.Types.ObjectId.isValid(val)) {
//         return typeof val === "string" ? new mongoose.Types.ObjectId(val) : val;
//       }
//       return null;
//     };

//     // Role-based restrictions
//     switch (role) {
//       case "superadmin":
//         break;
//       case "hotel":
//         query.hotelId = safeObjectId(hotelId || id);
//         break;
//       case "branch":
//         query.branchId = safeObjectId(branchId || id);
//         break;
//       case "valley":
//         query.valleyBoyId = safeObjectId(id);
//         break;
//       case "branchGroup":
//         if (hotelId) query.hotelId = safeObjectId(hotelId);
//         if (assignedBranchsId?.length) {
//           const validIds = assignedBranchsId.map(safeObjectId).filter(Boolean);
//           if (validIds.length) query.branchId = { $in: validIds };
//         }
//         break;
//       default:
//         return res.status(403).json({ message: "Unauthorized role" });
//     }

//     console.log("QUERY:", query); // 🔍 Debug

//     let parkingList = await Parking.find(query)
//       .populate("valleyBoyId", "name email phone role hotelId branchId")
//       .populate("userId", "name email phone")
//       .lean();

//     res.status(200).json(parkingList);
//   } catch (error) {
//     console.error("getParkingByLoc error:", error);
//     res.status(500).json({ error: error.message });
//   }
// };

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
