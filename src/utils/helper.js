const mongoose = require("mongoose");

exports.toObjectId = (value) => {
  if (mongoose.Types.ObjectId.isValid(value)) {
    return new mongoose.Types.ObjectId(value); // ✅ Use `new`
  }
  return null;
};

exports.generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

exports.normalizeRole = (role) => {
  return role ? role.toLowerCase() : "";
};
