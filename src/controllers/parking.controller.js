const mongoose = require("mongoose");
const Parking = require("../models/parking.model");
const ValleyBoy = require("../models/valleyboy.model");
const Hotel = require("../models/hotel.model");
const Branch = require("../models/branch.model");
// const { toObjectId } = require("../utils/helper");

// const toObjectId = (value) => {
//   if (mongoose.Types.ObjectId.isValid(value))
//     return mongoose.Types.ObjectId(value);
//   return null;
// };

const toObjectId = (value) => {
  if (mongoose.Types.ObjectId.isValid(value))
    return new mongoose.Types.ObjectId(value);
  return null;
};

// exports.updateParkingStatusOnly = async (req, res) => {
//   try {
//     const { status } = req.body;
//     const parking = await Parking.findByIdAndUpdate(
//       req.params.id,
//       { status },
//       { new: true }
//     );
//     if (!parking) return res.status(404).json({ error: "Parking not found" });
//     res.status(200).json(parking);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };

exports.updateParkingStatusOnly = async (req, res) => {
  try {
    const { status, latitude, longitude } = req.body;

    const updateData = { status };

    // Update coordinates if provided
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
      { unparkingTime, isParked: false },
      { new: true }
    );
    if (!parking) return res.status(404).json({ error: "Parking not found" });
    res.status(200).json(parking);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateParkingStatus = async (req, res) => {
  try {
    const { isParked, parkingTime, unparkingTime } = req.body;
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

// exports.getAllParking = async (req, res) => {
//   try {
//     const { role, id, hotelId, branchId } = req.user;
//     const query = {};

//     switch (role) {
//       case "superadmin":
//         // no filter, get all parkings
//         break;

//       case "hotel":
//         {
//           const hotelObjectId = toObjectId(id);
//           if (!hotelObjectId)
//             return res.status(400).json({ message: "Invalid hotel ID" });
//           query.hotelId = hotelObjectId;
//         }
//         break;

//       case "branch":
//         {
//           const branchObjectId = toObjectId(id);
//           if (!branchObjectId)
//             return res.status(400).json({ message: "Invalid branch ID" });
//           query.branchId = branchObjectId;
//         }
//         break;

//       case "valley":
//         {
//           const valleyObjectId = toObjectId(id);
//           if (!valleyObjectId)
//             return res.status(400).json({ message: "Invalid valley boy ID" });
//           query.valleyBoyId = valleyObjectId;
//         }
//         break;

//       case "branchGroup":
//         {
//           const hotelObjectId = toObjectId(hotelId);
//           if (hotelObjectId) query.hotelId = hotelObjectId;

//           if (branchId) {
//             if (Array.isArray(branchId)) {
//               const validBranchIds = branchId.map(toObjectId).filter(Boolean);
//               if (validBranchIds.length)
//                 query.branchId = { $in: validBranchIds };
//             } else {
//               const branchObjectId = toObjectId(branchId);
//               if (branchObjectId) query.branchId = branchObjectId;
//             }
//           }
//         }
//         break;

//       default:
//         return res.status(403).json({ message: "Unauthorized role" });
//     }

//     // Populate parking data
//     const parkingList = await Parking.find(query)
//       .populate("valleyBoyId", "name email phone role hotelId branchId") // include valley boy basic info
//       .populate("userId", "name email phone")
//       .lean(); // convert to plain JS objects for easier modification

//     // Populate hotel and branch details if exist
//     const result = await Promise.all(
//       parkingList.map(async (parking) => {
//         if (parking.valleyBoyId) {
//           if (parking.valleyBoyId.hotelId) {
//             const hotel = await Hotel.findById(
//               parking.valleyBoyId.hotelId,
//               "name email"
//             );
//             parking.valleyBoyId.hotel = hotel || null;
//           }
//           if (parking.valleyBoyId.branchId) {
//             const branch = await Branch.findById(
//               parking.valleyBoyId.branchId,
//               "name email"
//             );
//             parking.valleyBoyId.branch = branch || null;
//           }
//         }
//         return parking;
//       })
//     );

//     res.status(200).json(result);
//   } catch (error) {
//     console.error("getAllParking error:", error);
//     res.status(500).json({ error: error.message });
//   }
// };

// exports.getAllParking = async (req, res) => {
//   try {
//     const { role, id, hotelId, branchId, assignedBranchsId } = req.user;
//     const query = {};

//     // Role-based filtering
//     switch (role) {
//       case "superadmin":
//         // no filter
//         break;

//       case "hotel":
//         if (!hotelId)
//           return res.status(400).json({ message: "Hotel ID missing" });
//         query.hotelId = toObjectId(hotelId);
//         break;

//       case "branch":
//         if (!branchId)
//           return res.status(400).json({ message: "Branch ID missing" });
//         query.branchId = toObjectId(branchId);
//         break;

//       case "valley":
//         query.valleyBoyId = toObjectId(id);
//         break;

//       case "branchGroup":
//         if (hotelId) query.hotelId = toObjectId(hotelId);
//         if (assignedBranchsId && assignedBranchsId.length) {
//           const validBranchIds = assignedBranchsId
//             .map(toObjectId)
//             .filter(Boolean);
//           if (validBranchIds.length) query.branchId = { $in: validBranchIds };
//         }
//         break;

//       default:
//         return res.status(403).json({ message: "Unauthorized role" });
//     }

//     // Fetch parking records
//     let parkingList = await Parking.find(query)
//       .populate("valleyBoyId", "name email phone role hotelId branchId")
//       .populate("userId", "name email phone")
//       .lean();

//     // Populate hotel and branch info for each parking record
//     parkingList = await Promise.all(
//       parkingList.map(async (parking) => {
//         if (parking.valleyBoyId) {
//           if (parking.valleyBoyId.hotelId) {
//             const hotel = await Hotel.findById(
//               parking.valleyBoyId.hotelId,
//               "name email"
//             );
//             parking.valleyBoyId.hotel = hotel || null;
//           }
//           if (parking.valleyBoyId.branchId) {
//             const branch = await Branch.findById(
//               parking.valleyBoyId.branchId,
//               "name email"
//             );
//             parking.valleyBoyId.branch = branch || null;
//           }
//         }
//         return parking;
//       })
//     );

//     res.status(200).json(parkingList);
//   } catch (error) {
//     console.error("getAllParking error:", error);
//     res.status(500).json({ error: error.message });
//   }
// };

exports.getAllParking = async (req, res) => {
  try {
    const { role, id, hotelId, branchId, assignedBranchsId } = req.user;
    const query = {};

    // Helper to safely convert to ObjectId
    const safeObjectId = (val) => {
      try {
        return mongoose.Types.ObjectId(val);
      } catch {
        return null;
      }
    };

    switch (role) {
      case "superadmin":
        // no filter
        break;

      case "hotel":
        if (!hotelId)
          return res.status(400).json({ message: "Hotel ID missing" });
        query.hotelId = safeObjectId(hotelId);
        break;

      case "branch":
        if (!branchId)
          return res.status(400).json({ message: "Branch ID missing" });
        query.branchId = safeObjectId(branchId);
        break;

      case "valley":
        query.valleyBoyId = safeObjectId(id);
        break;

      case "branchGroup":
        if (hotelId) query.hotelId = safeObjectId(hotelId);
        if (assignedBranchsId && assignedBranchsId.length) {
          const validIds = assignedBranchsId.map(safeObjectId).filter(Boolean);
          if (validIds.length) query.branchId = { $in: validIds };
        }
        break;

      default:
        return res.status(403).json({ message: "Unauthorized role" });
    }

    // Fetch parking records
    let parkingList = await Parking.find(query)
      .populate("valleyBoyId", "name email phone role hotelId branchId")
      .populate("userId", "name email phone")
      .lean();

    // Populate hotel and branch info
    parkingList = await Promise.all(
      parkingList.map(async (parking) => {
        if (parking.valleyBoyId) {
          if (parking.valleyBoyId.hotelId) {
            const hotel = await Hotel.findById(
              parking.valleyBoyId.hotelId,
              "name email"
            );
            parking.valleyBoyId.hotel = hotel || null;
          }
          if (parking.valleyBoyId.branchId) {
            const branch = await Branch.findById(
              parking.valleyBoyId.branchId,
              "name email"
            );
            parking.valleyBoyId.branch = branch || null;
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
