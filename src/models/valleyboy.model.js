const mongoose = require("mongoose");

const valleyBoySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  supervisorId: { type: mongoose.Schema.Types.ObjectId, ref: "Supervisor", required: true }
}, { timestamps: true });

module.exports = mongoose.model("ValleyBoy", valleyBoySchema);
