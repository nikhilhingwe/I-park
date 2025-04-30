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
    phone: {
      type: String,
      validate: {
        validator: function (v) {
          return /^[0-9]{10}$/.test(v);
        },
        message: props => `${props.value} is not a valid 10-digit phone number!`
      }
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
