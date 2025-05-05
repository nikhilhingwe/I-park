const express = require('express');
const router = express.Router();

const authauthenticate = require("../middleware/authMiddleware");


const { addBranchGroup, getBranchGroups, updateBranchGroup, deleteBranchGroup} = require('../controllers/branchGroup.controller');


router.post('/add',authauthenticate, addBranchGroup);
router.get('/get',authauthenticate, getBranchGroups);
router.put('/update/:id',authauthenticate, updateBranchGroup);
router.delete('/delete/:id',authauthenticate, deleteBranchGroup);

module.exports = router;