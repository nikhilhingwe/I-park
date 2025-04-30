const express = require("express");
const router = express.Router();
const authauthenticate = require("../middleware/authMiddleware");
const { addBranch, getBranches, updateBranch, deleteBranch } = require("../controllers/branch.controller");


router.post("/add", addBranch);
router.get("/get",authauthenticate, getBranches);
router.put("/update/:id", updateBranch);    
// router.delete("/delete/:id", deleteBranch);

module.exports = router;

