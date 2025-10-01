const express = require("express");
const {
  createParking,
  getAllParking,
  getParkingById,
  updateParking,
  deleteParking,
  updateIsParked,
  updateParkingTime,
  updateUnparkingTime,
  updateParkingStatus,
  getParkingByRole,
  updateParkingStatusOnly,
} = require("../controllers/parking.controller");
const authenticate = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/add", createParking);
router.get("/get", authenticate, getAllParking);
router.get("/:id", authenticate, getParkingById);
router.put("/update/:id", authenticate, updateParking);
router.delete("/delete/:id", authenticate, deleteParking);
router.patch("/parkingTime/:id", authenticate, updateParkingTime);
router.patch("/unparkingTime/:id", authenticate, updateUnparkingTime);
router.patch("/status/:id", authenticate, updateParkingStatus);

router.patch("/status-update/:id", authenticate, updateParkingStatusOnly);

module.exports = router;
