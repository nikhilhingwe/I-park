const mongoose = require("mongoose");

const branchSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  address: { type: String },
  phone: {
    type: String,
    validate: {
      validator: function (v) {
        return /^[0-9]{10}$/.test(v);
      },
      message: props => `${props.value} is not a valid 10-digit phone number!`
    }
  },
  hotelId: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel", required: true },
  role: { type: Number, default: 3 }, // 3 for branch
}, { timestamps: true });

module.exports = mongoose.model("Branch", branchSchema);
