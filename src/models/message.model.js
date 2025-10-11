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
    whatsappId: String, // store original WhatsApp message ID
    fromNumber: String,
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
