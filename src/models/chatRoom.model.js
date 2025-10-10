// // const mongoose = require("mongoose");

// // const chatRoomSchema = new mongoose.Schema(
// //   {
// //     participants: [
// //       {
// //         userId: { type: mongoose.Schema.Types.ObjectId, required: true },
// //         role: { type: Number, required: true },
// //       },
// //     ],
// //     isGroup: { type: Boolean, default: false },
// //     createdBy: {
// //       userId: { type: mongoose.Schema.Types.ObjectId },
// //       role: { type: Number },
// //     },
// //   },
// //   { timestamps: true }
// // );

// // chatRoomSchema.index({ "participants.userId": 1 });

// // module.exports = mongoose.model("ChatRoom", chatRoomSchema);

// const mongoose = require("mongoose");

// const chatRoomSchema = new mongoose.Schema(
//   {
//     participants: [
//       {
//         userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//         role: Number,
//       },
//     ],
//     createdBy: {
//       userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//       role: Number,
//     },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("ChatRoom", chatRoomSchema);

const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    participants: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          index: true,
        },
        userModel: {
          type: String,
          required: true,
          enum: [
            "superadmin",
            "hotel",
            "branch",
            "branchgroup",
            "valleyboy",
            "user",
          ],
          index: true,
        },
      },
    ],
    lastMessage: { type: String, default: "" },
    lastMessageTime: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

chatSchema.index({
  "participants.userId": 1,
  "participants.userModel": 1,
});

module.exports = mongoose.model("Chat", chatSchema);
