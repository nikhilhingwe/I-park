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
} = require("../controllers/parking.controller");
const router = express.Router();

router.post("/add", createParking);
router.get("/get", getAllParking);
router.get("/:id", getParkingById);
router.put("/update/:id", updateParking);
router.delete("/delete/:id", deleteParking);
router.patch("/parkingTime/:id", updateParkingTime);
router.patch("/unparkingTime/:id", updateUnparkingTime);
router.patch("/status/:id", updateParkingStatus);

module.exports = router;
