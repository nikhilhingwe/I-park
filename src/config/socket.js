const { Server } = require("socket.io");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

// Models
const Chat = require("../models/chatRoom.model");
const Message = require("../models/message.model");
const Hotel = require("../models/hotel.model");
const Branch = require("../models/branch.model");
const BranchGroup = require("../models/branchGroup.model");
const ValleyBoy = require("../models/valleyboy.model");
const User = require("../models/user.model");
const SuperAdmin = require("../models/superAdmin.model");
const Parking = require("../models/parking.model");

// Helper: Normalize role
function normalizeRole(role) {
  if (!role) return null;
  if (!isNaN(role)) role = Number(role);
  switch (role) {
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
  const roleStr = String(role).toLowerCase();
  switch (roleStr) {
    case "superadmin":
      return "superadmin";
    case "hotel":
      return "hotel";
    case "branch":
      return "branch";
    case "branchgroup":
      return "branchgroup";
    case "valleyboy":
      return "valleyboy";
    case "user":
      return "user";
  }
  return null;
}

// Safe ObjectId
function safeObjectId(id) {
  return mongoose.isValidObjectId(id) ? new mongoose.Types.ObjectId(id) : null;
}

// Initialize socket
function initSocket(server) {
  const io = new Server(server, {
    cors: { origin: "*" },
    transports: ["websocket", "polling"],
  });

  // Track Valley Boy sockets
  const valleyBoySockets = new Map(); // userId -> socketId
  io.valleyBoySockets = valleyBoySockets;

  io.on("connection", (socket) => {
    console.log(`✅ New socket connected: ${socket.id}`);
    let user = null;

    // Authenticate token
    socket.on("credentials", (token) => {
      if (!token) return socket.disconnect();
      try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        if (!payload?.id || !payload?.role) return socket.disconnect();

        user = {
          id: payload.id,
          email: payload.email,
          role: normalizeRole(payload.role),
        };

        if (!user.role) return socket.disconnect();

        // Track Valley Boy sockets
        if (user.role === "valleyboy") {
          valleyBoySockets.set(user.id, socket.id);
          console.log(`📌 Valley Boy connected: ${user.id}`);
        }

        socket.emit("authenticated", { message: "Token valid" });
      } catch (err) {
        console.log("❌ Invalid token:", err.message);
        socket.disconnect();
      }
    });

    // ------------------- fetchChatList -------------------
    socket.on("fetchChatList", async () => {
      try {
        if (!user) return;
        const userId = safeObjectId(user.id);
        const userRole = user.role;

        const chats = await Chat.find({
          "participants.userId": userId,
          "participants.userModel": userRole,
        }).lean();

        const chatContacts = [];
        for (const chat of chats) {
          const other = chat.participants.find(
            (p) => p.userId.toString() !== user.id
          );
          if (!other) continue;

          let name = other.userModel;
          switch (other.userModel.toLowerCase()) {
            case "hotel":
              const h = await Hotel.findById(other.userId)
                .select("name")
                .lean();
              name = h?.name || "Hotel";
              break;
            case "branch":
              const b = await Branch.findById(other.userId)
                .select("name")
                .lean();
              name = b?.name || "Branch";
              break;
            case "branchgroup":
              const bg = await BranchGroup.findById(other.userId)
                .select("userName")
                .lean();
              name = bg?.userName || "Branch Group";
              break;
            case "valleyboy":
              const v = await ValleyBoy.findById(other.userId)
                .select("name")
                .lean();
              name = v?.name || "Valley Boy";
              break;
            case "user":
              const u = await User.findById(other.userId)
                .select("name phoneNumber")
                .lean();
              name = u?.name || u?.phoneNumber || "User";
              break;
            case "superadmin":
              const sa = await SuperAdmin.findById(other.userId)
                .select("username")
                .lean();
              name = sa?.username || "Super Admin";
              break;
          }

          chatContacts.push({
            _id: other.userId.toString(),
            role: other.userModel.toLowerCase(),
            name,
            lastMessage: chat.lastMessage || "",
            lastMessageTime: chat.lastMessageTime || null,
          });
        }

        // Add static contacts per role (same as before)
        let staticContacts = [];
        switch (userRole) {
          case "superadmin":
            const hotels = await Hotel.find().select("_id name").lean();
            const branches = await Branch.find().select("_id name").lean();
            const groups = await BranchGroup.find()
              .select("_id userName")
              .lean();
            const valleys = await ValleyBoy.find().select("_id name").lean();
            const appUsers = await User.find()
              .select("_id name phoneNumber")
              .lean();
            staticContacts = [
              ...hotels.map((h) => ({
                _id: h._id.toString(),
                role: "hotel",
                name: h.name,
              })),
              ...branches.map((b) => ({
                _id: b._id.toString(),
                role: "branch",
                name: b.name,
              })),
              ...groups.map((bg) => ({
                _id: bg._id.toString(),
                role: "branchgroup",
                name: bg.userName,
              })),
              ...valleys.map((v) => ({
                _id: v._id.toString(),
                role: "valleyboy",
                name: v.name,
              })),
              ...appUsers.map((u) => ({
                _id: u._id.toString(),
                role: "user",
                name: u.name || u.phoneNumber,
              })),
            ];
            break;
          case "hotel":
            const hotelBranches = await Branch.find({ hotelId: userId })
              .select("_id name")
              .lean();
            staticContacts = [
              ...hotelBranches.map((b) => ({
                _id: b._id.toString(),
                role: "branch",
                name: b.name,
              })),
              {
                _id: "superadmin-placeholder",
                role: "superadmin",
                name: "Super Admin",
              },
            ];
            break;
          case "branch":
            const branchData = await Branch.findById(userId)
              .select("hotelId")
              .lean();
            const hotelInfo = branchData?.hotelId
              ? await Hotel.findById(branchData.hotelId)
                  .select("_id name")
                  .lean()
              : null;
            staticContacts = [
              ...(hotelInfo
                ? [
                    {
                      _id: hotelInfo._id.toString(),
                      role: "hotel",
                      name: hotelInfo.name,
                    },
                  ]
                : []),
              {
                _id: "superadmin-placeholder",
                role: "superadmin",
                name: "Super Admin",
              },
            ];
            break;
          case "branchgroup":
            const assignedBranches = await Branch.find({
              _id: { $in: user.AssignedBranch || [] },
            })
              .select("_id name")
              .lean();
            staticContacts = assignedBranches.map((b) => ({
              _id: b._id.toString(),
              role: "branch",
              name: b.name,
            }));
            break;
          case "valleyboy":
            const vbBranch = user.branchId
              ? await Branch.findById(user.branchId).select("_id name").lean()
              : null;
            const vbHotel =
              !vbBranch && user.hotelId
                ? await Hotel.findById(user.hotelId).select("_id name").lean()
                : null;
            staticContacts = [
              ...(vbBranch
                ? [
                    {
                      _id: vbBranch._id.toString(),
                      role: "branch",
                      name: vbBranch.name,
                    },
                  ]
                : []),
              ...(vbHotel
                ? [
                    {
                      _id: vbHotel._id.toString(),
                      role: "hotel",
                      name: vbHotel.name,
                    },
                  ]
                : []),
            ];
            break;
          case "user":
            const userChats = await Chat.find({
              "participants.userId": userId,
              "participants.userModel": "user",
            }).lean();
            const valleyIds = userChats
              .map((c) =>
                c.participants.find((p) => p.userModel === "valleyboy")
              )
              .filter(Boolean);
            const valleyInfos = await ValleyBoy.find({
              _id: { $in: valleyIds.map((v) => v.userId) },
            })
              .select("_id name")
              .lean();
            staticContacts = valleyInfos.map((v) => ({
              _id: v._id.toString(),
              role: "valleyboy",
              name: v.name,
            }));
            break;
        }

        // Merge & remove duplicates
        const merged = [...chatContacts, ...staticContacts];
        const unique = [];
        const seen = new Set();
        for (const c of merged) {
          const key = `${c._id}-${c.role}`;
          if (!seen.has(key)) {
            seen.add(key);
            unique.push(c);
          }
        }

        socket.emit("chatList", unique);
      } catch (err) {
        console.error("❌ Error fetching chat list:", err);
        socket.emit("error", { message: "Failed to fetch chat list" });
      }
    });

    // ------------------- joinChat -------------------
    socket.on("joinChat", async (chatUserId, chatUserRole) => {
      try {
        if (!user) return;
        const senderId = safeObjectId(user.id);
        const receiverId = safeObjectId(chatUserId);
        const receiverRole = normalizeRole(chatUserRole);

        if (!senderId || !receiverId || !receiverRole)
          return socket.emit("error", { message: "Invalid receiver or role" });

        const senderRole = user.role;

        let chat = await Chat.findOne({
          participants: {
            $all: [
              { $elemMatch: { userId: senderId, userModel: senderRole } },
              { $elemMatch: { userId: receiverId, userModel: receiverRole } },
            ],
          },
        });

        if (!chat) {
          chat = await Chat.create({
            participants: [
              { userId: senderId, userModel: senderRole },
              { userId: receiverId, userModel: receiverRole },
            ],
          });
          console.log("✅ Created new chat:", chat._id.toString());
        }

        const roomId = chat._id.toString();
        socket.join(roomId);

        const messages = await Message.find({ chatId: roomId })
          .sort({ createdAt: 1 })
          .lean();
        socket.emit("chatHistory", messages);
      } catch (err) {
        console.error("❌ Error joining chat:", err.message);
        socket.emit("error", { message: "Failed to join chat" });
      }
    });

    // ------------------- sendMessage -------------------
    socket.on("sendMessage", async ({ chatUserId, chatUserRole, text }) => {
      try {
        if (!user || !chatUserId || !text) return;

        const senderId = safeObjectId(user.id);
        const receiverId = safeObjectId(chatUserId);
        const senderRole = user.role;
        const receiverRole = normalizeRole(chatUserRole);

        if (!senderId || !receiverId || !receiverRole)
          return socket.emit("error", { message: "Invalid IDs or role" });

        let chat = await Chat.findOne({
          participants: {
            $all: [
              { $elemMatch: { userId: senderId, userModel: senderRole } },
              { $elemMatch: { userId: receiverId, userModel: receiverRole } },
            ],
          },
        });

        if (!chat) {
          chat = await Chat.create({
            participants: [
              { userId: senderId, userModel: senderRole },
              { userId: receiverId, userModel: receiverRole },
            ],
          });
        }

        const roomId = chat._id.toString();
        const message = await Message.create({
          chatId: roomId,
          text,
          sender: { userId: senderId, userModel: senderRole },
          deliveredTo: [],
          readBy: [],
        });

        await Chat.findByIdAndUpdate(roomId, {
          lastMessage: text,
          lastMessageTime: new Date(),
        });

        io.to(roomId).emit("newMessage", message);
      } catch (err) {
        console.error("❌ Error sending message:", err.message);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // ------------------- WhatsApp reply -------------------
    socket.on("sendWhatsAppReply", async ({ from, message, parkingId }) => {
      try {
        if (!parkingId || !message) return;
        const parking = await Parking.findById(parkingId);
        if (!parking) return;

        const valleyBoyId = parking.valleyBoyId;
        if (!valleyBoyId) return;

        const valleyBoySocketId = valleyBoySockets.get(valleyBoyId.toString());
        if (!valleyBoySocketId) return;

        io.to(valleyBoySocketId).emit("incomingWhatsAppMessage", {
          from,
          message,
          parkingId,
          valleyBoyName: parking.valleyBoyName || "Valley Boy",
        });
      } catch (err) {
        console.error("❌ Error sending WhatsApp message to Valley Boy:", err);
      }
    });

    // ------------------- disconnect -------------------
    socket.on("disconnect", () => {
      if (user?.role === "valleyboy") valleyBoySockets.delete(user.id);
      console.log(`❌ Disconnected: ${socket.id}`);
    });
  });

  return io;
}

module.exports = initSocket;
