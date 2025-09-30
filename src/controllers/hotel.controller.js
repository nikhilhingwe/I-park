const Hotel = require("../models/hotel.model");
const { encrypt, decrypt } = require("../utils/crypto");
const findSameUsername = require("../utils/usernameUniqueCheck");

exports.createHotel = async (req, res) => {
  const { name, email, password, address, phone } = req.body;

  console.log(req.body);

  console.log(name, email, password, phone, address);

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
      password: encryptedPassword,
      address,
      phone,
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

    hotelList?.forEach((item) => {
      const decryptedPwd = decrypt(item.password);
      item.password = decryptedPwd;
    });

    res.status(200).json(hotelList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateHotel = async (req, res) => {
  const { id } = req.params;
  const { name, email, password, address, phone } = req.body;

  try {
    const existingHotel = await Hotel.findById(id);
    if (!existingHotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }

    if (email && email !== existingHotel.email) {
      const existingUserByUsername = await findSameUsername(email);
      if (existingUserByUsername.exists) {
        return res.status(400).json({ message: "This email already exists" });
      }
      existingHotel.email = email;
    }

    // Update fields if provided
    if (name) existingHotel.name = name;
    if (password) existingHotel.password = encrypt(password);
    if (address) existingHotel.address = address;
    if (phone) existingHotel.phone = phone;

    const updatedHotel = await existingHotel.save();

    res.status(200).json({
      hotel: updatedHotel,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteHotel = async (req, res) => {
  const { id } = req.params;

  try {
    const hotel = await Hotel.findByIdAndDelete(id);

    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }

    res.status(200).json({ message: "Hotel deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
