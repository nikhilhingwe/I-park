const express = require("express");
const { addValleyBoy, getValleyBoy } = require("../controllers/valleyboy.controller");

const router = express.Router();

router.post("/add", addValleyBoy);
router.get("/getAll", getValleyBoy);

module.exports = router;