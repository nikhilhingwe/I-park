const Hotel = require("../models/hotel.model");
const { encrypt, decrypt } = require("../utils/crypto");
const findSameUsername = require("../utils/usernameUniqueCheck");


exports.createHotel = async (req, res) => {
  const { name, email,password, address, phone } = req.body;

  try {
       
       // Check if hotel email already exists
       const existingUserByUsername = await findSameUsername(email);
    if (existingUserByUsername.exists) {
      return res.status(400).json({ message: "This email already exists" });
    }
    
    const encryptedPassword = encrypt(password);
    
    const newHotel = new Hotel({
         name,
         email,
         password:encryptedPassword,
         address,
         phone
     });
     
     const hotel = await newHotel.save();

    res.status(201).json({
      hotel: hotel,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getHotels = async (req, res) => {
  try {
    const hotelList = await Hotel.find();

    hotelList?.forEach(item => {
      const decryptedPwd = decrypt(item.password);
      item.password = decryptedPwd;
    });

    res.status(200).json(hotelList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
