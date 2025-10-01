const mongoose = require("mongoose");

exports.toObjectId = (value) => {
  if (mongoose.Types.ObjectId.isValid(value)) {
    return new mongoose.Types.ObjectId(value); // ✅ Use `new`
  }
  return null;
};
