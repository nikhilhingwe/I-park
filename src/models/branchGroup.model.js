const mongoose = require("mongoose");

const branchGroupSchema = new mongoose.Schema({
  userName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  assignedBranchsId: [{ type: mongoose.Schema.Types.ObjectId, ref: "Branch" }],
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
  hotelId: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel", },
  role: { type: Number, default: 4 }, // 4 for branch group
}, { timestamps: true });

module.exports = mongoose.model("BranchGroup", branchGroupSchema);