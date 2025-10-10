// // const mongoose = require("mongoose");

// // const messageSchema = new mongoose.Schema(
// //   {
// //     roomId: {
// //       type: mongoose.Schema.Types.ObjectId,
// //       ref: "ChatRoom",
// //       required: true,
// //     },
// //     sender: {
// //       userId: { type: mongoose.Schema.Types.ObjectId, required: true },
// //       role: { type: Number, required: true },
// //     },
// //     message: { type: String, required: true },
// //     messageType: {
// //       type: String,
// //       enum: ["text", "image", "file"],
// //       default: "text",
// //     },
// //     fileUrl: { type: String },
// //     source: { type: String, enum: ["app", "whatsapp"], default: "app" },
// //     seenBy: [{ userId: mongoose.Schema.Types.ObjectId, role: Number }],
// //   },
// //   { timestamps: true }
// // );

// // messageSchema.index({ roomId: 1, createdAt: -1 });

// // module.exports = mongoose.model("Message", messageSchema);

// const mongoose = require("mongoose");

// const messageSchema = new mongoose.Schema(
//   {
//     roomId: { type: mongoose.Schema.Types.ObjectId, ref: "ChatRoom" },
//     sender: {
//       userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//       role: Number,
//     },
//     message: String,
//     source: { type: String, enum: ["app", "whatsapp"], default: "app" },
//     readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Message", messageSchema);

const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
    sender: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
      userModel: {
        type: String,
        enum: [
          "superadmin",
          "hotel",
          "branch",
          "branchgroup",
          "valleyboy",
          "user",
        ],
        required: true,
      },
    },
    text: { type: String, required: true },
    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
    },
    deliveredTo: [
      {
        userId: mongoose.Schema.Types.ObjectId,
        userModel: String,
      },
    ],
    readBy: [
      {
        userId: mongoose.Schema.Types.ObjectId,
        userModel: String,
      },
    ],
  },
  { timestamps: true }
);

messageSchema.index({ chatId: 1 });
messageSchema.index({ "sender.userId": 1 });

module.exports = mongoose.model("Message", messageSchema);
