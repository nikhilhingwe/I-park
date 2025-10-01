const jwt = require("jsonwebtoken");
const Verification = require("../models/verification.model");
const SuperAdmin = require("../models/superAdmin.model");
const Hotel = require("../models/hotel.model");
const Branch = require("../models/branch.model");
const BranchGroup = require("../models/branchGroup.model");
const ValleyBoy = require("../models/valleyboy.model");

const authenticate = async (req, res, next) => {
  let token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    const authHeader = req.headers.authorization;
    token = authHeader && authHeader.split(" ")[1];
  }
  if (!token) {
    return res.status(401).json({ message: "Authorization token is required" });
  }

  try {
    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fast token check: must match any valid DB token for user and not be expired
    const dbToken = await Verification.findOne({
      userId: decoded.id,
      token,
      expireAt: { $gt: new Date() },
    });
    if (!dbToken) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    // Assign user role and details (only if token matches)
    let user;
    let sperr = false;
    user = await SuperAdmin.findById(decoded.id);
    if (user) {
      req.user = { id: decoded.id, role: "superadmin" };
      sperr = true;
    } else {
      user = await Hotel.findById(decoded.id);
      if (user) {
        req.user = { id: user._id, role: "hotel", hotelId: user._id };
        sperr = true;
      } else {
        user = await Branch.findById(decoded.id);
        if (user) {
          req.user = { id: user._id, role: "branch", branchId: user._id };
          sperr = true;
        } else {
          user = await BranchGroup.findById(decoded.id);
          if (user) {
            req.user = {
              id: user._id,
              role: "branchGroup",
              hotelId: user.hotelId,
              assignedBranchsId: user.assignedBranchsId,
            };
            sperr = true;
          } else {
            user = await ValleyBoy.findById(decoded.id);
            if (user) {
              req.user = {
                id: user._id,
                role: "valley",
                hotelId: user.hotelId,
                branchId: user.branchId,
              };
              sperr = true;
            } else {
              req.user = null;
              sperr = false;
            }
          }
        }
      }
    }

    if (!sperr) {
      return res.status(404).json({ message: "User not found" });
    }
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid token" });
  }
};

module.exports = authenticate;
