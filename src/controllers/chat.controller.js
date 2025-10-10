// // const ChatRoom = require("../models/ChatRoom");
// // const Message = require("../models/Message");
// // const canChat = require("../utils/canChat");
// // const { sendWhatsAppMessage } = require("../services/whatsapp.service");

// // // Create or get chat room
// // exports.getOrCreateRoom = async (req, res) => {
// //   try {
// //     const { receiverId, receiverRole } = req.body;
// //     const senderId = req.user._id;
// //     const senderRole = req.user.role;

// //     if (!canChat(senderRole, receiverRole)) {
// //       return res.status(403).json({ message: "Not allowed to chat" });
// //     }

// //     let room = await ChatRoom.findOne({
// //       "participants.userId": { $all: [senderId, receiverId] },
// //     });

// //     if (!room) {
// //       room = await ChatRoom.create({
// //         participants: [
// //           { userId: senderId, role: senderRole },
// //           { userId: receiverId, role: receiverRole },
// //         ],
// //         createdBy: { userId: senderId, role: senderRole },
// //       });
// //     }

// //     res.json(room);
// //   } catch (err) {
// //     console.error(err);
// //     res.status(500).json({ message: "Server error" });
// //   }
// // };

// // // Send message from app
// // exports.sendMessage = async (req, res) => {
// //   try {
// //     const { roomId, message } = req.body;
// //     const senderId = req.user._id;
// //     const senderRole = req.user.role;

// //     const room = await ChatRoom.findById(roomId);
// //     if (!room) return res.status(404).json({ message: "Room not found" });

// //     const msg = await Message.create({
// //       roomId,
// //       sender: { userId: senderId, role: senderRole },
// //       message,
// //       source: "app",
// //     });

// //     // find user participant if replying to a User
// //     const userParticipant = room.participants.find((p) => p.role === 6);
// //     if (userParticipant && senderRole !== 6) {
// //       // send WhatsApp
// //       const user = await require("../models/User").findById(
// //         userParticipant.userId
// //       );
// //       await sendWhatsAppMessage(user.phoneNumber, message);
// //     }

// //     // emit socket event
// //     global.io.to(roomId.toString()).emit("newMessage", msg);

// //     res.json(msg);
// //   } catch (err) {
// //     console.error(err);
// //     res.status(500).json({ message: "Server error" });
// //   }
// // };

// // // Get messages of a room
// // exports.getMessages = async (req, res) => {
// //   try {
// //     const { roomId } = req.params;
// //     const messages = await Message.find({ roomId }).sort({ createdAt: 1 });
// //     res.json(messages);
// //   } catch (err) {
// //     console.error(err);
// //     res.status(500).json({ message: "Server error" });
// //   }
// // };

// const ChatRoom = require("../models/chatRoom.model");
// const Message = require("../models/message.model");
// const User = require("../models/user.model");
// const canChat = require("../utils/canChat");

// // ✅ Create or get chat room
// exports.getOrCreateRoom = async (req, res) => {
//   try {
//     const { receiverId, receiverRole } = req.body;
//     const senderId = req.user._id;
//     const senderRole = req.user.role;

//     if (!canChat(senderRole, receiverRole)) {
//       return res.status(403).json({ message: "Not allowed to chat" });
//     }

//     let room = await ChatRoom.findOne({
//       "participants.userId": { $all: [senderId, receiverId] },
//     });

//     if (!room) {
//       room = await ChatRoom.create({
//         participants: [
//           { userId: senderId, role: senderRole },
//           { userId: receiverId, role: receiverRole },
//         ],
//         createdBy: { userId: senderId, role: senderRole },
//       });
//     }

//     res.json(room);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // ✅ Send message
// exports.sendMessage = async (req, res) => {
//   try {
//     const { roomId, message } = req.body;
//     const senderId = req.user._id;
//     const senderRole = req.user.role;

//     const room = await ChatRoom.findById(roomId);
//     if (!room) return res.status(404).json({ message: "Room not found" });

//     const msg = await Message.create({
//       roomId,
//       sender: { userId: senderId, role: senderRole },
//       message,
//       source: "app",
//       readBy: [senderId],
//     });

//     global.io.to(roomId.toString()).emit("newMessage", msg);
//     res.json(msg);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // ✅ Get messages of a room
// exports.getMessages = async (req, res) => {
//   try {
//     const { roomId } = req.params;
//     const messages = await Message.find({ roomId }).sort({ createdAt: 1 });
//     res.json(messages);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // ✅ Get chat list (with last message and unread count)
// exports.getChatList = async (req, res) => {
//   try {
//     const userId = req.user._id;
//     const userRole = req.user.role;

//     const rooms = await ChatRoom.find({
//       "participants.userId": userId,
//     }).sort({ updatedAt: -1 });

//     const chatList = await Promise.all(
//       rooms.map(async (room) => {
//         const lastMessage = await Message.findOne({ roomId: room._id })
//           .sort({ createdAt: -1 })
//           .limit(1);

//         const unreadCount = await Message.countDocuments({
//           roomId: room._id,
//           readBy: { $ne: userId },
//         });

//         const other = room.participants.find(
//           (p) => p.userId.toString() !== userId.toString()
//         );
//         const otherUser = await User.findById(other.userId);

//         return {
//           roomId: room._id,
//           lastMessage: lastMessage ? lastMessage.message : "",
//           unreadCount,
//           participant: {
//             _id: otherUser._id,
//             name: otherUser.name,
//             role: otherUser.role,
//           },
//         };
//       })
//     );

//     // filter based on role hierarchy
//     const allowedRoles = {
//       1: [1, 2, 3, 4, 5, 6],
//       2: [1, 3],
//       3: [1, 2],
//       4: [3],
//       5: [3, 6],
//       6: [2, 3, 5],
//     };

//     const filtered = chatList.filter((chat) =>
//       allowedRoles[userRole]?.includes(chat.participant.role)
//     );

//     res.json(filtered);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

const Chat = require("../models/chatRoom.model");
const Hotel = require("../models/hotel.model");
const Branch = require("../models/branch.model");
const BranchGroup = require("../models/branchGroup.model");
const ValleyBoy = require("../models/valleyboy.model");
const User = require("../models/user.model");
const SuperAdmin = require("../models/superAdmin.model");
const mongoose = require("mongoose");

exports.getContactsByRole = async (req, res) => {
  try {
    const { id: userId, role } = req.user;
    const userObjectId = new mongoose.Types.ObjectId(userId);
    let users = [];

    switch (role) {
      case 1: // SuperAdmin
        const hotels = await Hotel.find().select("_id name").lean();
        const branches = await Branch.find().select("_id name hotelId").lean();
        const groups = await BranchGroup.find().select("_id userName").lean();
        const valleys = await ValleyBoy.find().select("_id name").lean();
        const appUsers = await User.find()
          .select("_id name phoneNumber")
          .lean();

        users = [
          ...hotels.map((h) => ({
            _id: h._id,
            role: "hotel",
            name: h.name,
          })),
          ...branches.map((b) => ({
            _id: b._id,
            role: "branch",
            name: b.name,
          })),
          ...groups.map((g) => ({
            _id: g._id,
            role: "branchgroup",
            name: g.userName,
          })),
          ...valleys.map((v) => ({
            _id: v._id,
            role: "valleyboy",
            name: v.name,
          })),
          ...appUsers.map((u) => ({
            _id: u._id,
            role: "user",
            name: u.name || u.phoneNumber,
          })),
        ];
        break;

      case 2: // Hotel
        const hotelBranches = await Branch.find({ hotelId: userObjectId })
          .select("_id name")
          .lean();
        users = [
          ...hotelBranches.map((b) => ({
            _id: b._id,
            role: "branch",
            name: b.name,
          })),
          {
            _id: "superadmin",
            role: "superadmin",
            name: "Super Admin",
          },
        ];
        break;

      case 3: // Branch
        const hotel = await Hotel.findById(req.user.hotelId)
          .select("_id name")
          .lean();
        users = [
          ...(hotel
            ? [
                {
                  _id: hotel._id,
                  role: "hotel",
                  name: hotel.name,
                },
              ]
            : []),
          {
            _id: "superadmin",
            role: "superadmin",
            name: "Super Admin",
          },
        ];
        break;

      case 4: // Branch Group
        const assignedBranches = await Branch.find({
          _id: { $in: req.user.assignedBranchsId || [] },
        })
          .select("_id name")
          .lean();
        users = assignedBranches.map((b) => ({
          _id: b._id,
          role: "branch",
          name: b.name,
        }));
        break;

      case 5: // ValleyBoy
        const valleyBranch = req.user.branchId
          ? await Branch.findById(req.user.branchId).select("_id name").lean()
          : null;
        const valleyHotel = !valleyBranch
          ? await Hotel.findById(req.user.hotelId).select("_id name").lean()
          : null;
        users = [
          ...(valleyBranch
            ? [
                {
                  _id: valleyBranch._id,
                  role: "branch",
                  name: valleyBranch.name,
                },
              ]
            : []),
          ...(valleyHotel
            ? [{ _id: valleyHotel._id, role: "hotel", name: valleyHotel.name }]
            : []),
        ];
        break;

      case 6: // User
        // users can only chat with the valley boy who sent them a message
        const userChats = await Chat.find({
          "participants.userId": userObjectId,
          "participants.userModel": "user",
        }).lean();
        const valleyIds = userChats
          .map((chat) =>
            chat.participants.find((p) => p.userModel === "valleyboy")
          )
          .filter(Boolean);

        const valleyInfos = await ValleyBoy.find({
          _id: { $in: valleyIds.map((v) => v.userId) },
        })
          .select("_id name")
          .lean();

        users = valleyInfos.map((v) => ({
          _id: v._id,
          role: "valleyboy",
          name: v.name,
        }));
        break;
    }

    res.json({ contacts: users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching contacts" });
  }
};

exports.accessChat = async (req, res) => {
  try {
    const { targetId, targetRole } = req.body;
    const { id: userId, role } = req.user;

    if (!targetId || !targetRole) {
      return res.status(400).json({ message: "Target required" });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const targetObjectId = new mongoose.Types.ObjectId(targetId);

    let chat = await Chat.findOne({
      participants: {
        $all: [
          { $elemMatch: { userId: userObjectId, userModel: mapRole(role) } },
          { $elemMatch: { userId: targetObjectId, userModel: targetRole } },
        ],
      },
    });

    if (!chat) {
      chat = await Chat.create({
        participants: [
          { userId: userObjectId, userModel: mapRole(role) },
          { userId: targetObjectId, userModel: targetRole },
        ],
      });
    }

    res.json({ chat });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error accessing chat" });
  }
};

function mapRole(num) {
  switch (num) {
    case 1:
      return "superadmin";
    case 2:
      return "hotel";
    case 3:
      return "branch";
    case 4:
      return "branchgroup";
    case 5:
      return "valleyboy";
    case 6:
      return "user";
  }
}
