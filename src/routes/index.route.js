const express = require("express");
const router = express.Router();

// const userRoutes = require("./user.routes");
// const authRoutes = require("./auth.routes");
const superAdminRoutes = require("./superAdmin.route");
const userRoutes = require("./user.route");
const valleyBoyRoutes = require("./valleyboy.route")
const hotelRoutes = require("./hotel.route");


router.use("/superadmin", superAdminRoutes);
router.use("/user", userRoutes);
router.use("/valleyboy",valleyBoyRoutes );
router.use("/hotel",hotelRoutes );


// Prefix routes
// router.use("/users", userRoutes);
// router.use("/auth", authRoutes);

module.exports = router;
