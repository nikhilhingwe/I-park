const mongoose = require("mongoose");

const verificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    userModel: { type: String, required: true },
    token: { type: String, required: true },
    expireAt: { type: Date, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Verification", verificationSchema);
