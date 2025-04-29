const express = require('express');
const router = express.Router();

const { createHotel, getHotels } = require('../controllers/hotel.controller');

router.post('/add', createHotel);
router.get('/get', getHotels);

module.exports = router;

