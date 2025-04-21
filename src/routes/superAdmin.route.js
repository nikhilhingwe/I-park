const express = require("express");
const { registerSuperAdmin } = require("../controllers/superAdmin.controller");

const router = express.Router();

router.post("/register", registerSuperAdmin);

module.exports = router;
