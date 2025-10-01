const express = require("express");
const {
  addValleyBoy,
  getValleyBoy,
  updateValleyBoy,
  deleteValleyBoy,
  toggleValleyBoyStatus,
  generateValleyBoyQR,
} = require("../controllers/valleyboy.controller");
const authenticate = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/add", addValleyBoy);
router.get("/get", authenticate, getValleyBoy);
router.put("/update/:id", authenticate, updateValleyBoy);
router.delete("/delete/:id", authenticate, deleteValleyBoy);

router.patch("/valleyBoy/:id/status", authenticate, toggleValleyBoyStatus);

// Generate QR for a single ValleyBoy by ID
router.get("/valleyBoy/:id/qr", authenticate, generateValleyBoyQR);

// Generate QR for all online ValleyBoys
router.get("/valleyBoys/qr/online", authenticate, generateValleyBoyQR);

module.exports = router;
