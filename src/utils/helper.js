const mongoose = require("mongoose");

const toObjectId = (value) => {
  if (mongoose.Types.ObjectId.isValid(value)) {
    return mongoose.Types.ObjectId(value);
  }
  return null;
};

module.exports = { toObjectId };
