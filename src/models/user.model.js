// // const mongoose = require("mongoose");

// // const userSchema = new mongoose.Schema(
// //   {
// //     name: { type: String },
// //     phoneNumber: {
// //       type: String,
// //       required: true,
// //       unique: true,
// //       validate: {
// //         validator: function (v) {
// //           return /^[0-9]{10}$/.test(v);
// //         },
// //         message: (props) =>
// //           `${props.value} is not a valid 10-digit phone number!`,
// //       },
// //     },
// //     otp: { type: String },
// //     otpExpires: { type: Date },
// //   },
// //   { timestamps: true }
// // );

// // module.exports = mongoose.model("User", userSchema);

// const mongoose = require("mongoose");

// const userSchema = new mongoose.Schema(
//   {
//     name: { type: String },
//     phoneNumber: {
//       type: String,
//       required: true,
//       unique: true,
//       validate: {
//         validator: function (v) {
//           return /^[0-9]{10}$/.test(v);
//         },
//         message: (props) =>
//           `${props.value} is not a valid 10-digit phone number!`,
//       },
//     },
//     email: { type: String, unique: true, sparse: true },
//     otp: { type: String },
//     otpExpires: { type: Date },
//     role: { type: Number, default: 6 },
//     address: { type: String },
//     isVerified: { type: Boolean, default: false },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("User", userSchema);

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function (v) {
          return /^[0-9]{10}$/.test(v);
        },
        message: (props) =>
          `${props.value} is not a valid 10-digit phone number!`,
      },
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      required: false,
      trim: true,
    },
    otp: { type: String },
    otpExpires: { type: Date },
    role: { type: Number, default: 6 },
    address: { type: String },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
