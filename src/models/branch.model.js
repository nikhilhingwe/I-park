const mongoose = require("mongoose");

const branchSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  address: { type: String },
  phone: { type: String },
  hotelId: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel", required: true }
}, { timestamps: true });

module.exports = mongoose.model("Branch", branchSchema);
