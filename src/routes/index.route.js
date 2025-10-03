const express = require("express");
const router = express.Router();

// const userRoutes = require("./user.routes");
// const authRoutes = require("./auth.routes");
const superAdminRoutes = require("./superAdmin.route");
const userRoutes = require("./user.route");
const valleyBoyRoutes = require("./valleyboy.route");
const hotelRoutes = require("./hotel.route");
const branchRoutes = require("./branch.route");
const branchGroupRoutes = require("./branchGroup.route");
const parkingRoutes = require("./parking.routes");
const authenticate = require("../middleware/authMiddleware");

router.use("/superadmin", superAdminRoutes);
router.use("/user", userRoutes);
router.use("/valleyboy", valleyBoyRoutes);
router.use("/hotel", hotelRoutes);
router.use("/branchgroup", branchGroupRoutes);
router.use("/branch", branchRoutes);
router.use("/parking", parkingRoutes);

// Prefix routes
// router.use("/users", userRoutes);
// router.use("/auth", authRoutes);

module.exports = router;
