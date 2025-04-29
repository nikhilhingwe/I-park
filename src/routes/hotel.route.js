const express = require('express');
const router = express.Router();

const { createHotel, getHotels, updateHotel, deleteHotel } = require('../controllers/hotel.controller');

router.post('/add', createHotel);
router.get('/get', getHotels);
router.put('/update/:id', updateHotel);
router.delete('/delete/:id', deleteHotel);

module.exports = router;

