const express = require('express');
const router = express.Router();

const { addBranchGroup} = require('../controllers/branchGroup.controller');


router.post('/add', addBranchGroup);
// router.get('/get', getBrachGroup);
// router.put('/update/:id', updateBrachGroup);
// router.delete('/delete/:id', deleteBrachGroup);

module.exports = router;