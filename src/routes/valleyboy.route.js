const express = require("express");
const {
  addValleyBoy,
  getValleyBoy,
  updateValleyBoy,
  deleteValleyBoy,
  toggleValleyBoyStatus,
  generateValleyBoyQR,
} = require("../controllers/valleyboy.controller");

const router = express.Router();

router.post("/add", addValleyBoy);
router.get("/get", getValleyBoy);
router.put("/update/:id", updateValleyBoy);
router.delete("/delete/:id", deleteValleyBoy);

router.patch("/valleyBoy/:id/status", toggleValleyBoyStatus);

// Generate QR for a single ValleyBoy by ID
router.get("/valleyBoy/:id/qr", generateValleyBoyQR);

// Generate QR for all online ValleyBoys
router.get("/valleyBoys/qr/online", generateValleyBoyQR);

module.exports = router;
