const express = require("express");
const { addValleyBoy } = require("../controllers/valleyboy.controller");

const router = express.Router();

router.post("/register", addValleyBoy);

module.exports = router;