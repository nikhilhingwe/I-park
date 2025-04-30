const mongoose = require("mongoose");

const valleyBoySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: {
    type: String,
    validate: {
      validator: function (v) {
        return /^[0-9]{10}$/.test(v);
      },
      message: props => `${props.value} is not a valid 10-digit phone number!`
    }
  },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profileImage: { type: String }, // Base64 string
  hotelId: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel", required: true },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true },
  supervisorId: { type: mongoose.Schema.Types.ObjectId, ref: "Supervisor", required: true },
  role: { type: Number, default: 5 }
}, { timestamps: true });

module.exports = mongoose.model("ValleyBoy", valleyBoySchema);
