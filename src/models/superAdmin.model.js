const mongoose = require("mongoose");

const superAdminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    role: {
      type: Number,
      default: 1,
      
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("SuperAdmin", superAdminSchema);
