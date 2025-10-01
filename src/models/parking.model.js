// const mongoose = require("mongoose");

// const parkingSchema = new mongoose.Schema(
//   {
//     vehicleNumber: { type: String, required: true },
//     userName: { type: String, required: true },
//     userNumber: {
//       type: String,
//       required: true,
//       validate: {
//         validator: function (v) {
//           return /^[0-9]{10}$/.test(v);
//         },
//         message: (props) =>
//           `${props.value} is not a valid 10-digit phone number!`,
//       },
//     },
//     userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//     isParked: { type: Boolean, default: false },
//     hotelId: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel" },
//     branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch" },
//     valleyBoyId: { type: mongoose.Schema.Types.ObjectId, ref: "ValleyBoy" },
//     status: {
//       type: String,
//       enum: ["pending", "accepted", "rejected"],
//       default: "pending",
//     },
//     parkingTime: { type: Date },
//     unparkingTime: { type: Date },
//     parkingLocation: { type: String },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Parking", parkingSchema);

const mongoose = require("mongoose");

const parkingSchema = new mongoose.Schema(
  {
    vehicleNumber: { type: String, required: true },
    userName: { type: String, required: true },
    userNumber: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^[0-9]{10}$/.test(v);
        },
        message: (props) =>
          `${props.value} is not a valid 10-digit phone number!`,
      },
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    isParked: { type: Boolean, default: false },
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel" },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch" },
    valleyBoyId: { type: mongoose.Schema.Types.ObjectId, ref: "ValleyBoy" },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    parkingTime: { type: Date },
    unparkingTime: { type: Date },
    parkingLocation: { type: String }, // optional textual description

    // New field for storing user location
    location: {
      type: {
        type: String, // "Point"
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
        validate: {
          validator: function (v) {
            return v.length === 2;
          },
          message: "Coordinates must be an array of [longitude, latitude]",
        },
      },
    },
  },
  { timestamps: true }
);

// Create a geospatial index for location
parkingSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Parking", parkingSchema);
