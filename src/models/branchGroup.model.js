const mongoose = require("mongoose");

const branchGroupSchema = new mongoose.Schema({
  userName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  address: { type: String },
  phone: { type: String },
  hotelId: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel", required: true }
}, { timestamps: true });

module.exports = mongoose.model("BranchGroup", branchGroupSchema);