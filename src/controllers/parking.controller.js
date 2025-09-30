const Parking = require("../models/parking.model");

// Update only isParked field
exports.updateIsParked = async (req, res) => {
  try {
    const { isParked } = req.body;
    const parking = await Parking.findByIdAndUpdate(
      req.params.id,
      { isParked },
      { new: true }
    );
    if (!parking) return res.status(404).json({ error: "Parking not found" });
    res.status(200).json(parking);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update only parkingTime field
exports.updateParkingTime = async (req, res) => {
  try {
    let { parkingTime } = req.body;
    if (!parkingTime) parkingTime = new Date();
    const parking = await Parking.findByIdAndUpdate(
      req.params.id,
      { parkingTime, isParked: true },
      { new: true }
    );
    if (!parking) return res.status(404).json({ error: "Parking not found" });
    res.status(200).json(parking);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update only unparkingTime field
exports.updateUnparkingTime = async (req, res) => {
  try {
    let { unparkingTime } = req.body;
    if (!unparkingTime) unparkingTime = new Date();
    const parking = await Parking.findByIdAndUpdate(
      req.params.id,
      { unparkingTime, isParked: false },
      { new: true }
    );
    if (!parking) return res.status(404).json({ error: "Parking not found" });
    res.status(200).json(parking);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
// Update parking status, parking time, and unparking time
exports.updateParkingStatus = async (req, res) => {
  try {
    const { isParked, parkingTime, unparkingTime } = req.body;
    const parking = await Parking.findByIdAndUpdate(
      req.params.id,
      { isParked, parkingTime, unparkingTime },
      { new: true }
    );
    if (!parking) return res.status(404).json({ error: "Parking not found" });
    res.status(200).json(parking);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Create a new parking record
exports.createParking = async (req, res) => {
  try {
    const parking = new Parking(req.body);
    await parking.save();
    res.status(201).json(parking);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all parking records
exports.getAllParking = async (req, res) => {
  try {
    const parkingList = await Parking.find().populate(
      "hotelId branchId valleyBoyId userId"
    );
    res.status(200).json(parkingList);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single parking record by ID
exports.getParkingById = async (req, res) => {
  try {
    const parking = await Parking.findById(req.params.id).populate(
      "hotelId branchId valleyBoyId userId"
    );
    if (!parking) return res.status(404).json({ error: "Parking not found" });
    res.status(200).json(parking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a parking record by ID
exports.updateParking = async (req, res) => {
  try {
    const parking = await Parking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!parking) return res.status(404).json({ error: "Parking not found" });
    res.status(200).json(parking);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a parking record by ID
exports.deleteParking = async (req, res) => {
  try {
    const parking = await Parking.findByIdAndDelete(req.params.id);
    if (!parking) return res.status(404).json({ error: "Parking not found" });
    res.status(200).json({ message: "Parking deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
