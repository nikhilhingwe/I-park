const mongoose = require("mongoose");

const supervisorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true }
}, { timestamps: true });

module.exports = mongoose.model("Supervisor", supervisorSchema);
