const SuperAdmin = require("../models/superAdmin.model");
const Hotel = require("../models/hotel.model");
const Branch = require("../models/branch.model");
const Supervisor = require("../models/supervisor.model");
const ValleyBoy = require("../models/valleyboy.model");


const findSameUsername = async (email) => {
  try {
    if (!email) throw new Error("Email is required");

    const queries = [
      Hotel.findOne({ email }).lean(),
      Branch.findOne({ email }).lean(),
      Supervisor.findOne({ email }).lean(),
      ValleyBoy.findOne({ email }).lean(),
      SuperAdmin.findOne({ email }).lean(),
    ];

    const results = await Promise.all(queries);

    if (results.some((result) => result)) {
      return { message: "Email already exists", exists: true };
    }

    return { message: "Email is available", exists: false };
  } catch (error) {
    console.error("Error finding username:", error.message);
    throw new Error("An error occurred while checking username availability.");
  }
};

module.exports = findSameUsername;
