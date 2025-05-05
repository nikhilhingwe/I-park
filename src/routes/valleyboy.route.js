const express = require("express");
const { addValleyBoy, getValleyBoy, updateValleyBoy, deleteValleyBoy } = require("../controllers/valleyboy.controller");

const router = express.Router();

router.post("/add", addValleyBoy);
router.get("/getAll", getValleyBoy);
router.put("/update/:id", updateValleyBoy);
router.delete("/delete/:id", deleteValleyBoy);

module.exports = router;