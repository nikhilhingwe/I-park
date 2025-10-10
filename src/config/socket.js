// // // // // // // // // // // // // const { Server } = require("socket.io");

// // // // // // // // // // // // // function initSocket(server) {
// // // // // // // // // // // // //   const io = new Server(server, {
// // // // // // // // // // // // //     cors: { origin: "*" },
// // // // // // // // // // // // //   });
// // // // // // // // // // // // //   global.io = io;

// // // // // // // // // // // // //   io.on("connection", (socket) => {
// // // // // // // // // // // // //     console.log("🔥 Socket connected", socket.id);

// // // // // // // // // // // // //     // client joins room
// // // // // // // // // // // // //     socket.on("joinRoom", (roomId) => {
// // // // // // // // // // // // //       socket.join(roomId);
// // // // // // // // // // // // //     });

// // // // // // // // // // // // //     socket.on("disconnect", () => {
// // // // // // // // // // // // //       console.log("❌ Socket disconnected", socket.id);
// // // // // // // // // // // // //     });
// // // // // // // // // // // // //   });
// // // // // // // // // // // // // }

// // // // // // // // // // // // // module.exports = initSocket;

// // // // // // // // // // // // const { Server } = require("socket.io");
// // // // // // // // // // // // const jwt = require("jsonwebtoken");
// // // // // // // // // // // // const User = require("../models/user.model"); // make sure your User model path is correct

// // // // // // // // // // // // function initSocket(server) {
// // // // // // // // // // // //   const io = new Server(server, {
// // // // // // // // // // // //     cors: {
// // // // // // // // // // // //       origin: "*", // replace * with your frontend URL in production
// // // // // // // // // // // //       methods: ["GET", "POST"],
// // // // // // // // // // // //     },
// // // // // // // // // // // //   });

// // // // // // // // // // // //   global.io = io;

// // // // // // // // // // // //   // Optional: JWT authentication for socket connections
// // // // // // // // // // // //   io.use(async (socket, next) => {
// // // // // // // // // // // //     try {
// // // // // // // // // // // //       const token = socket.handshake.auth?.token;
// // // // // // // // // // // //       if (!token) return next(new Error("No token provided"));

// // // // // // // // // // // //       const decoded = jwt.verify(token, process.env.JWT_SECRET);
// // // // // // // // // // // //       const user = await User.findById(decoded.id);
// // // // // // // // // // // //       if (!user) return next(new Error("User not found"));

// // // // // // // // // // // //       socket.user = user; // attach user info to socket
// // // // // // // // // // // //       next();
// // // // // // // // // // // //     } catch (err) {
// // // // // // // // // // // //       console.error("Socket auth error:", err.message);
// // // // // // // // // // // //       next(new Error("Authentication error"));
// // // // // // // // // // // //     }
// // // // // // // // // // // //   });

// // // // // // // // // // // //   io.on("connection", (socket) => {
// // // // // // // // // // // //     console.log("🔥 Socket connected:", socket.id, socket.user?.name);

// // // // // // // // // // // //     // Join chat room
// // // // // // // // // // // //     socket.on("joinRoom", (roomId) => {
// // // // // // // // // // // //       socket.join(roomId);
// // // // // // // // // // // //       console.log(
// // // // // // // // // // // //         `User ${socket.user?.name || socket.id} joined room ${roomId}`
// // // // // // // // // // // //       );
// // // // // // // // // // // //     });

// // // // // // // // // // // //     // Leave chat room
// // // // // // // // // // // //     socket.on("leaveRoom", (roomId) => {
// // // // // // // // // // // //       socket.leave(roomId);
// // // // // // // // // // // //       console.log(`User ${socket.user?.name || socket.id} left room ${roomId}`);
// // // // // // // // // // // //     });

// // // // // // // // // // // //     // Handle sending messages via socket
// // // // // // // // // // // //     socket.on("sendMessage", async ({ roomId, message }) => {
// // // // // // // // // // // //       if (!roomId || !message) return;

// // // // // // // // // // // //       const msgData = {
// // // // // // // // // // // //         roomId,
// // // // // // // // // // // //         sender: { userId: socket.user._id, role: socket.user.role },
// // // // // // // // // // // //         message,
// // // // // // // // // // // //         createdAt: new Date(),
// // // // // // // // // // // //         source: "app",
// // // // // // // // // // // //       };

// // // // // // // // // // // //       // Broadcast to room
// // // // // // // // // // // //       io.to(roomId).emit("newMessage", msgData);
// // // // // // // // // // // //     });

// // // // // // // // // // // //     // Disconnect
// // // // // // // // // // // //     socket.on("disconnect", () => {
// // // // // // // // // // // //       console.log("❌ Socket disconnected:", socket.id, socket.user?.name);
// // // // // // // // // // // //     });
// // // // // // // // // // // //   });
// // // // // // // // // // // // }

// // // // // // // // // // // // module.exports = initSocket;

// // // // // // // // // // // const { Server } = require("socket.io");
// // // // // // // // // // // const jwt = require("jsonwebtoken");
// // // // // // // // // // // const User = require("../models/user.model");

// // // // // // // // // // // function initSocket(server) {
// // // // // // // // // // //   const io = new Server(server, {
// // // // // // // // // // //     cors: { origin: "*", methods: ["GET", "POST"] },
// // // // // // // // // // //   });
// // // // // // // // // // //   global.io = io;

// // // // // // // // // // //   io.use(async (socket, next) => {
// // // // // // // // // // //     try {
// // // // // // // // // // //       const token = socket.handshake.auth?.token;
// // // // // // // // // // //       if (!token) return next(new Error("No token"));

// // // // // // // // // // //       const decoded = jwt.verify(token, process.env.JWT_SECRET);
// // // // // // // // // // //       const user = await User.findById(decoded.id);
// // // // // // // // // // //       if (!user) return next(new Error("User not found"));

// // // // // // // // // // //       socket.user = user;
// // // // // // // // // // //       next();
// // // // // // // // // // //     } catch (err) {
// // // // // // // // // // //       console.error("Socket auth error:", err.message);
// // // // // // // // // // //       next(new Error("Authentication error"));
// // // // // // // // // // //     }
// // // // // // // // // // //   });

// // // // // // // // // // //   io.on("connection", (socket) => {
// // // // // // // // // // //     console.log("🔥 Socket connected:", socket.id, socket.user?.name);

// // // // // // // // // // //     socket.on("joinRoom", (roomId) => {
// // // // // // // // // // //       socket.join(roomId);
// // // // // // // // // // //       console.log(`${socket.user?.name || socket.id} joined room ${roomId}`);
// // // // // // // // // // //     });

// // // // // // // // // // //     socket.on("sendMessage", ({ roomId, message }) => {
// // // // // // // // // // //       if (!roomId || !message) return;

// // // // // // // // // // //       const msgData = {
// // // // // // // // // // //         roomId,
// // // // // // // // // // //         sender: { userId: socket.user._id, role: socket.user.role },
// // // // // // // // // // //         message,
// // // // // // // // // // //         createdAt: new Date(),
// // // // // // // // // // //         source: "app",
// // // // // // // // // // //       };

// // // // // // // // // // //       io.to(roomId).emit("newMessage", msgData);
// // // // // // // // // // //     });

// // // // // // // // // // //     socket.on("disconnect", () => {
// // // // // // // // // // //       console.log("❌ Socket disconnected:", socket.id, socket.user?.name);
// // // // // // // // // // //     });
// // // // // // // // // // //   });
// // // // // // // // // // // }

// // // // // // // // // // // module.exports = initSocket;

// // // // // // // // // // import { Server } from "socket.io";
// // // // // // // // // // import mongoose from "mongoose";
// // // // // // // // // // import jwt from "jsonwebtoken";

// // // // // // // // // // import { Chat } from "../../Models/chatBox.model.js";
// // // // // // // // // // import { Message } from "../../Models/chatBoxMessage.model.js";
// // // // // // // // // // import Hotel from "../../Models/hotel.js";
// // // // // // // // // // import Branch from "../../Models/branch.js";
// // // // // // // // // // import BranchGroup from "../../Models/branchGroup.js";
// // // // // // // // // // import ValleyBoy from "../../Models/valleyBoy.js";
// // // // // // // // // // import User from "../../Models/user.js";
// // // // // // // // // // import SuperAdmin from "../../Models/superAdmin.js";
// // // // // // // // // // import { normalizeRole } from "../../Utils/utils.js";

// // // // // // // // // // function initSocket(server) {
// // // // // // // // // //   const io = new Server(server, { cors: { origin: "*" } });

// // // // // // // // // //   io.on("connection", (socket) => {
// // // // // // // // // //     console.log(`✅ New socket connected: ${socket.id}`);
// // // // // // // // // //     let user = null;

// // // // // // // // // //     // 🔐 Authenticate socket
// // // // // // // // // //     socket.on("credentials", (token) => {
// // // // // // // // // //       try {
// // // // // // // // // //         user = jwt.verify(token, process.env.JWT_SECRET);
// // // // // // // // // //         user.role = normalizeRole(user.role);
// // // // // // // // // //         console.log(`🔐 Authenticated user: ${user.id} (${user.role})`);
// // // // // // // // // //       } catch (err) {
// // // // // // // // // //         console.log("❌ Invalid token");
// // // // // // // // // //         socket.disconnect();
// // // // // // // // // //       }
// // // // // // // // // //     });

// // // // // // // // // //     // Helper: Safe ObjectId
// // // // // // // // // //     function safeObjectId(id) {
// // // // // // // // // //       return mongoose.isValidObjectId(id)
// // // // // // // // // //         ? new mongoose.Types.ObjectId(id)
// // // // // // // // // //         : null;
// // // // // // // // // //     }

// // // // // // // // // //     // 📨 Fetch Chat List
// // // // // // // // // //     socket.on("fetchChatList", async () => {
// // // // // // // // // //       try {
// // // // // // // // // //         if (!user) return;
// // // // // // // // // //         const userId = safeObjectId(user.id);
// // // // // // // // // //         const userRole = user.role;

// // // // // // // // // //         // 1️⃣ Fetch existing chats
// // // // // // // // // //         let chats = [];
// // // // // // // // // //         if (userId) {
// // // // // // // // // //           chats = await Chat.find({
// // // // // // // // // //             participants: { $elemMatch: { userId, userModel: userRole } },
// // // // // // // // // //           }).lean();
// // // // // // // // // //         }

// // // // // // // // // //         const chatContacts = [];
// // // // // // // // // //         for (const chat of chats) {
// // // // // // // // // //           const other = chat.participants.find(
// // // // // // // // // //             (p) => p.userId.toString() !== user.id
// // // // // // // // // //           );
// // // // // // // // // //           if (!other) continue;

// // // // // // // // // //           let displayName = other.userModel;
// // // // // // // // // //           switch (other.userModel.toLowerCase()) {
// // // // // // // // // //             case "hotel":
// // // // // // // // // //               const h = safeObjectId(other.userId)
// // // // // // // // // //                 ? await Hotel.findById(other.userId).select("name").lean()
// // // // // // // // // //                 : null;
// // // // // // // // // //               displayName = h?.name || "Hotel";
// // // // // // // // // //               break;
// // // // // // // // // //             case "branch":
// // // // // // // // // //               const b = safeObjectId(other.userId)
// // // // // // // // // //                 ? await Branch.findById(other.userId).select("name").lean()
// // // // // // // // // //                 : null;
// // // // // // // // // //               displayName = b?.name || "Branch";
// // // // // // // // // //               break;
// // // // // // // // // //             case "branchgroup":
// // // // // // // // // //               const bg = safeObjectId(other.userId)
// // // // // // // // // //                 ? await BranchGroup.findById(other.userId)
// // // // // // // // // //                     .select("userName")
// // // // // // // // // //                     .lean()
// // // // // // // // // //                 : null;
// // // // // // // // // //               displayName = bg?.userName || "Branch Group";
// // // // // // // // // //               break;
// // // // // // // // // //             case "valleyboy":
// // // // // // // // // //               const v = safeObjectId(other.userId)
// // // // // // // // // //                 ? await ValleyBoy.findById(other.userId).select("name").lean()
// // // // // // // // // //                 : null;
// // // // // // // // // //               displayName = v?.name || "Valley Boy";
// // // // // // // // // //               break;
// // // // // // // // // //             case "user":
// // // // // // // // // //               const u = safeObjectId(other.userId)
// // // // // // // // // //                 ? await User.findById(other.userId)
// // // // // // // // // //                     .select("name phoneNumber")
// // // // // // // // // //                     .lean()
// // // // // // // // // //                 : null;
// // // // // // // // // //               displayName = u?.name || u?.phoneNumber || "User";
// // // // // // // // // //               break;
// // // // // // // // // //             case "superadmin":
// // // // // // // // // //               const sa = safeObjectId(other.userId)
// // // // // // // // // //                 ? await SuperAdmin.findById(other.userId)
// // // // // // // // // //                     .select("username")
// // // // // // // // // //                     .lean()
// // // // // // // // // //                 : null;
// // // // // // // // // //               displayName = sa?.username || "Super Admin";
// // // // // // // // // //               break;
// // // // // // // // // //           }

// // // // // // // // // //           chatContacts.push({
// // // // // // // // // //             _id: other.userId.toString(),
// // // // // // // // // //             role: other.userModel.toLowerCase(),
// // // // // // // // // //             name: displayName,
// // // // // // // // // //             lastMessage: chat.lastMessage || "",
// // // // // // // // // //             lastMessageTime: chat.lastMessageTime || null,
// // // // // // // // // //           });
// // // // // // // // // //         }

// // // // // // // // // //         // 2️⃣ Static contacts based on role
// // // // // // // // // //         let staticContacts = [];
// // // // // // // // // //         switch (userRole) {
// // // // // // // // // //           case "superadmin":
// // // // // // // // // //             const hotels = await Hotel.find().select("_id name").lean();
// // // // // // // // // //             const branches = await Branch.find().select("_id name").lean();
// // // // // // // // // //             const groups = await BranchGroup.find()
// // // // // // // // // //               .select("_id userName")
// // // // // // // // // //               .lean();
// // // // // // // // // //             const valleys = await ValleyBoy.find().select("_id name").lean();
// // // // // // // // // //             const appUsers = await User.find()
// // // // // // // // // //               .select("_id name phoneNumber")
// // // // // // // // // //               .lean();
// // // // // // // // // //             staticContacts = [
// // // // // // // // // //               ...hotels.map((h) => ({
// // // // // // // // // //                 _id: h._id.toString(),
// // // // // // // // // //                 role: "hotel",
// // // // // // // // // //                 name: h.name,
// // // // // // // // // //               })),
// // // // // // // // // //               ...branches.map((b) => ({
// // // // // // // // // //                 _id: b._id.toString(),
// // // // // // // // // //                 role: "branch",
// // // // // // // // // //                 name: b.name,
// // // // // // // // // //               })),
// // // // // // // // // //               ...groups.map((bg) => ({
// // // // // // // // // //                 _id: bg._id.toString(),
// // // // // // // // // //                 role: "branchgroup",
// // // // // // // // // //                 name: bg.userName,
// // // // // // // // // //               })),
// // // // // // // // // //               ...valleys.map((v) => ({
// // // // // // // // // //                 _id: v._id.toString(),
// // // // // // // // // //                 role: "valleyboy",
// // // // // // // // // //                 name: v.name,
// // // // // // // // // //               })),
// // // // // // // // // //               ...appUsers.map((u) => ({
// // // // // // // // // //                 _id: u._id.toString(),
// // // // // // // // // //                 role: "user",
// // // // // // // // // //                 name: u.name || u.phoneNumber,
// // // // // // // // // //               })),
// // // // // // // // // //             ];
// // // // // // // // // //             break;

// // // // // // // // // //           case "hotel":
// // // // // // // // // //             const hotelBranches = await Branch.find({ hotelId: userId })
// // // // // // // // // //               .select("_id name")
// // // // // // // // // //               .lean();
// // // // // // // // // //             staticContacts = [
// // // // // // // // // //               ...hotelBranches.map((b) => ({
// // // // // // // // // //                 _id: b._id.toString(),
// // // // // // // // // //                 role: "branch",
// // // // // // // // // //                 name: b.name,
// // // // // // // // // //               })),
// // // // // // // // // //               {
// // // // // // // // // //                 _id: "superadmin-placeholder",
// // // // // // // // // //                 role: "superadmin",
// // // // // // // // // //                 name: "Super Admin",
// // // // // // // // // //               },
// // // // // // // // // //             ];
// // // // // // // // // //             break;

// // // // // // // // // //           case "branch":
// // // // // // // // // //             // Fetch hotel for this branch
// // // // // // // // // //             const branchData = await Branch.findById(userId)
// // // // // // // // // //               .select("hotelId")
// // // // // // // // // //               .lean();
// // // // // // // // // //             const hotelInfo = branchData?.hotelId
// // // // // // // // // //               ? await Hotel.findById(branchData.hotelId)
// // // // // // // // // //                   .select("_id name")
// // // // // // // // // //                   .lean()
// // // // // // // // // //               : null;

// // // // // // // // // //             staticContacts = [
// // // // // // // // // //               ...(hotelInfo
// // // // // // // // // //                 ? [
// // // // // // // // // //                     {
// // // // // // // // // //                       _id: hotelInfo._id.toString(),
// // // // // // // // // //                       role: "hotel",
// // // // // // // // // //                       name: hotelInfo.name,
// // // // // // // // // //                     },
// // // // // // // // // //                   ]
// // // // // // // // // //                 : []),
// // // // // // // // // //               {
// // // // // // // // // //                 _id: "superadmin-placeholder",
// // // // // // // // // //                 role: "superadmin",
// // // // // // // // // //                 name: "Super Admin",
// // // // // // // // // //               },
// // // // // // // // // //             ];
// // // // // // // // // //             break;

// // // // // // // // // //           case "branchgroup":
// // // // // // // // // //             const assignedBranches = await Branch.find({
// // // // // // // // // //               _id: { $in: user.AssignedBranch || [] },
// // // // // // // // // //             })
// // // // // // // // // //               .select("_id name")
// // // // // // // // // //               .lean();
// // // // // // // // // //             staticContacts = assignedBranches.map((b) => ({
// // // // // // // // // //               _id: b._id.toString(),
// // // // // // // // // //               role: "branch",
// // // // // // // // // //               name: b.name,
// // // // // // // // // //             }));
// // // // // // // // // //             break;

// // // // // // // // // //           case "valleyboy":
// // // // // // // // // //             const vbBranch = user.branchId
// // // // // // // // // //               ? await Branch.findById(user.branchId).select("_id name").lean()
// // // // // // // // // //               : null;
// // // // // // // // // //             const vbHotel = !vbBranch
// // // // // // // // // //               ? await Hotel.findById(user.hotelId).select("_id name").lean()
// // // // // // // // // //               : null;
// // // // // // // // // //             staticContacts = [
// // // // // // // // // //               ...(vbBranch
// // // // // // // // // //                 ? [
// // // // // // // // // //                     {
// // // // // // // // // //                       _id: vbBranch._id.toString(),
// // // // // // // // // //                       role: "branch",
// // // // // // // // // //                       name: vbBranch.name,
// // // // // // // // // //                     },
// // // // // // // // // //                   ]
// // // // // // // // // //                 : []),
// // // // // // // // // //               ...(vbHotel
// // // // // // // // // //                 ? [
// // // // // // // // // //                     {
// // // // // // // // // //                       _id: vbHotel._id.toString(),
// // // // // // // // // //                       role: "hotel",
// // // // // // // // // //                       name: vbHotel.name,
// // // // // // // // // //                     },
// // // // // // // // // //                   ]
// // // // // // // // // //                 : []),
// // // // // // // // // //             ];
// // // // // // // // // //             break;

// // // // // // // // // //           case "user":
// // // // // // // // // //             // Only valley boys who already chatted
// // // // // // // // // //             const userChats = await Chat.find({
// // // // // // // // // //               "participants.userId": userId,
// // // // // // // // // //               "participants.userModel": "user",
// // // // // // // // // //             }).lean();
// // // // // // // // // //             const valleyIds = userChats
// // // // // // // // // //               .map((c) =>
// // // // // // // // // //                 c.participants.find((p) => p.userModel === "valleyboy")
// // // // // // // // // //               )
// // // // // // // // // //               .filter(Boolean);
// // // // // // // // // //             const valleyInfos = await ValleyBoy.find({
// // // // // // // // // //               _id: { $in: valleyIds.map((v) => v.userId) },
// // // // // // // // // //             })
// // // // // // // // // //               .select("_id name")
// // // // // // // // // //               .lean();
// // // // // // // // // //             staticContacts = valleyInfos.map((v) => ({
// // // // // // // // // //               _id: v._id.toString(),
// // // // // // // // // //               role: "valleyboy",
// // // // // // // // // //               name: v.name,
// // // // // // // // // //             }));
// // // // // // // // // //             break;
// // // // // // // // // //         }

// // // // // // // // // //         // 3️⃣ Merge & deduplicate
// // // // // // // // // //         const merged = [...chatContacts, ...staticContacts];
// // // // // // // // // //         const unique = [];
// // // // // // // // // //         const seen = new Set();
// // // // // // // // // //         for (const c of merged) {
// // // // // // // // // //           const key = `${c._id}-${c.role}`;
// // // // // // // // // //           if (!seen.has(key)) {
// // // // // // // // // //             seen.add(key);
// // // // // // // // // //             unique.push(c);
// // // // // // // // // //           }
// // // // // // // // // //         }

// // // // // // // // // //         socket.emit("chatList", unique);
// // // // // // // // // //       } catch (err) {
// // // // // // // // // //         console.error("❌ Error fetching chat list:", err);
// // // // // // // // // //         socket.emit("error", { message: "Failed to fetch chat list" });
// // // // // // // // // //       }
// // // // // // // // // //     });

// // // // // // // // // //     // 🏷️ Join Chat
// // // // // // // // // //     socket.on("joinChat", async (chatUserId, chatUserRole) => {
// // // // // // // // // //       try {
// // // // // // // // // //         if (!user) return;
// // // // // // // // // //         const senderId = safeObjectId(user.id);
// // // // // // // // // //         const receiverId = safeObjectId(chatUserId);
// // // // // // // // // //         if (!senderId || !receiverId) return;

// // // // // // // // // //         const senderRole = user.role;
// // // // // // // // // //         const receiverRole = normalizeRole(chatUserRole);

// // // // // // // // // //         let chat = await Chat.findOne({
// // // // // // // // // //           participants: {
// // // // // // // // // //             $all: [
// // // // // // // // // //               { $elemMatch: { userId: senderId, userModel: senderRole } },
// // // // // // // // // //               { $elemMatch: { userId: receiverId, userModel: receiverRole } },
// // // // // // // // // //             ],
// // // // // // // // // //           },
// // // // // // // // // //         });

// // // // // // // // // //         if (!chat) {
// // // // // // // // // //           chat = await Chat.create({
// // // // // // // // // //             participants: [
// // // // // // // // // //               { userId: senderId, userModel: senderRole },
// // // // // // // // // //               { userId: receiverId, userModel: receiverRole },
// // // // // // // // // //             ],
// // // // // // // // // //           });
// // // // // // // // // //         }

// // // // // // // // // //         const roomId = chat._id.toString();
// // // // // // // // // //         socket.join(roomId);

// // // // // // // // // //         const messages = await Message.find({ chatId: roomId })
// // // // // // // // // //           .sort({ createdAt: 1 })
// // // // // // // // // //           .lean();
// // // // // // // // // //         socket.emit("chatHistory", messages);
// // // // // // // // // //       } catch (err) {
// // // // // // // // // //         console.error("❌ Error joining chat:", err);
// // // // // // // // // //       }
// // // // // // // // // //     });

// // // // // // // // // //     // ✉️ Send Message
// // // // // // // // // //     socket.on("sendMessage", async ({ chatUserId, chatUserRole, text }) => {
// // // // // // // // // //       try {
// // // // // // // // // //         if (!user || !chatUserId || !text) return;

// // // // // // // // // //         const senderId = safeObjectId(user.id);
// // // // // // // // // //         const receiverId = safeObjectId(chatUserId);
// // // // // // // // // //         if (!senderId || !receiverId) return;

// // // // // // // // // //         const senderRole = user.role;
// // // // // // // // // //         const receiverRole = normalizeRole(chatUserRole);

// // // // // // // // // //         let chat = await Chat.findOne({
// // // // // // // // // //           participants: {
// // // // // // // // // //             $all: [
// // // // // // // // // //               { $elemMatch: { userId: senderId, userModel: senderRole } },
// // // // // // // // // //               { $elemMatch: { userId: receiverId, userModel: receiverRole } },
// // // // // // // // // //             ],
// // // // // // // // // //           },
// // // // // // // // // //         });

// // // // // // // // // //         if (!chat) {
// // // // // // // // // //           chat = await Chat.create({
// // // // // // // // // //             participants: [
// // // // // // // // // //               { userId: senderId, userModel: senderRole },
// // // // // // // // // //               { userId: receiverId, userModel: receiverRole },
// // // // // // // // // //             ],
// // // // // // // // // //           });
// // // // // // // // // //         }

// // // // // // // // // //         const roomId = chat._id.toString();

// // // // // // // // // //         const message = await Message.create({
// // // // // // // // // //           chatId: roomId,
// // // // // // // // // //           text,
// // // // // // // // // //           sender: { userId: senderId, userModel: senderRole },
// // // // // // // // // //           deliveredTo: [],
// // // // // // // // // //           readBy: [],
// // // // // // // // // //         });

// // // // // // // // // //         await Chat.findByIdAndUpdate(roomId, {
// // // // // // // // // //           lastMessage: text,
// // // // // // // // // //           lastMessageTime: new Date(),
// // // // // // // // // //         });

// // // // // // // // // //         io.to(roomId).emit("newMessage", message);
// // // // // // // // // //         console.log(`💬 Message sent to room ${roomId}`);

// // // // // // // // // //         // ✅ Optional: Forward user messages to WhatsApp here if needed
// // // // // // // // // //       } catch (err) {
// // // // // // // // // //         console.error("❌ Error sending message:", err);
// // // // // // // // // //         socket.emit("error", { message: "Failed to send message" });
// // // // // // // // // //       }
// // // // // // // // // //     });

// // // // // // // // // //     // 🔴 Disconnect
// // // // // // // // // //     socket.on("disconnect", () => {
// // // // // // // // // //       console.log(`❌ Disconnected: ${socket.id}`);
// // // // // // // // // //     });
// // // // // // // // // //   });
// // // // // // // // // // }

// // // // // // // // // // module.exports = initSocket;

// // // // // // // // // const { Server } = require("socket.io");
// // // // // // // // // const mongoose = require("mongoose");
// // // // // // // // // const jwt = require("jsonwebtoken");

// // // // // // // // // const Chat = require("../models/chatRoom.model");
// // // // // // // // // const Message = require("../models/message.model");
// // // // // // // // // const Hotel = require("../models/hotel.model");
// // // // // // // // // const Branch = require("../models/branch.model");
// // // // // // // // // const BranchGroup = require("../models/branchGroup.model");
// // // // // // // // // const ValleyBoy = require("../models/valleyboy.model");
// // // // // // // // // const User = require("../models/user.model");
// // // // // // // // // const SuperAdmin = require("../models/superAdmin.model");
// // // // // // // // // const { normalizeRole } = require("../utils/helper");
// // // // // // // // // // const { normalizeRole } = require("../utils/helper");
// // // // // // // // // // const { normalizeRole } = require("../utils/helper");

// // // // // // // // // function initSocket(server) {
// // // // // // // // //   const io = new Server(server, { cors: { origin: "*" } });

// // // // // // // // //   io.on("connection", (socket) => {
// // // // // // // // //     console.log(`✅ New socket connected: ${socket.id}`);
// // // // // // // // //     let user = null;

// // // // // // // // //     // 🔐 Authenticate socket
// // // // // // // // //     socket.on("credentials", (token) => {
// // // // // // // // //       try {
// // // // // // // // //         user = jwt.verify(token, process.env.JWT_SECRET);
// // // // // // // // //         user.role = normalizeRole(user.role);
// // // // // // // // //         console.log(`🔐 Authenticated user: ${user.id} (${user.role})`);
// // // // // // // // //       } catch (err) {
// // // // // // // // //         console.log("❌ Invalid token");
// // // // // // // // //         socket.disconnect();
// // // // // // // // //       }
// // // // // // // // //     });

// // // // // // // // //     function safeObjectId(id) {
// // // // // // // // //       return mongoose.isValidObjectId(id)
// // // // // // // // //         ? new mongoose.Types.ObjectId(id)
// // // // // // // // //         : null;
// // // // // // // // //     }

// // // // // // // // //     // 📨 Fetch Chat List
// // // // // // // // //     socket.on("fetchChatList", async () => {
// // // // // // // // //       try {
// // // // // // // // //         if (!user) return;
// // // // // // // // //         const userId = safeObjectId(user.id);
// // // // // // // // //         const userRole = user.role;

// // // // // // // // //         let chats = [];
// // // // // // // // //         if (userId) {
// // // // // // // // //           chats = await Chat.find({
// // // // // // // // //             participants: { $elemMatch: { userId, userModel: userRole } },
// // // // // // // // //           }).lean();
// // // // // // // // //         }

// // // // // // // // //         const chatContacts = [];
// // // // // // // // //         for (const chat of chats) {
// // // // // // // // //           const other = chat.participants.find(
// // // // // // // // //             (p) => p.userId.toString() !== user.id
// // // // // // // // //           );
// // // // // // // // //           if (!other) continue;

// // // // // // // // //           let displayName = other.userModel;
// // // // // // // // //           switch (other.userModel.toLowerCase()) {
// // // // // // // // //             case "hotel":
// // // // // // // // //               const h = safeObjectId(other.userId)
// // // // // // // // //                 ? await Hotel.findById(other.userId).select("name").lean()
// // // // // // // // //                 : null;
// // // // // // // // //               displayName = h?.name || "Hotel";
// // // // // // // // //               break;
// // // // // // // // //             case "branch":
// // // // // // // // //               const b = safeObjectId(other.userId)
// // // // // // // // //                 ? await Branch.findById(other.userId).select("name").lean()
// // // // // // // // //                 : null;
// // // // // // // // //               displayName = b?.name || "Branch";
// // // // // // // // //               break;
// // // // // // // // //             case "branchgroup":
// // // // // // // // //               const bg = safeObjectId(other.userId)
// // // // // // // // //                 ? await BranchGroup.findById(other.userId)
// // // // // // // // //                     .select("userName")
// // // // // // // // //                     .lean()
// // // // // // // // //                 : null;
// // // // // // // // //               displayName = bg?.userName || "Branch Group";
// // // // // // // // //               break;
// // // // // // // // //             case "valleyboy":
// // // // // // // // //               const v = safeObjectId(other.userId)
// // // // // // // // //                 ? await ValleyBoy.findById(other.userId).select("name").lean()
// // // // // // // // //                 : null;
// // // // // // // // //               displayName = v?.name || "Valley Boy";
// // // // // // // // //               break;
// // // // // // // // //             case "user":
// // // // // // // // //               const u = safeObjectId(other.userId)
// // // // // // // // //                 ? await User.findById(other.userId)
// // // // // // // // //                     .select("name phoneNumber")
// // // // // // // // //                     .lean()
// // // // // // // // //                 : null;
// // // // // // // // //               displayName = u?.name || u?.phoneNumber || "User";
// // // // // // // // //               break;
// // // // // // // // //             case "superadmin":
// // // // // // // // //               const sa = safeObjectId(other.userId)
// // // // // // // // //                 ? await SuperAdmin.findById(other.userId)
// // // // // // // // //                     .select("username")
// // // // // // // // //                     .lean()
// // // // // // // // //                 : null;
// // // // // // // // //               displayName = sa?.username || "Super Admin";
// // // // // // // // //               break;
// // // // // // // // //           }

// // // // // // // // //           chatContacts.push({
// // // // // // // // //             _id: other.userId.toString(),
// // // // // // // // //             role: other.userModel.toLowerCase(),
// // // // // // // // //             name: displayName,
// // // // // // // // //             lastMessage: chat.lastMessage || "",
// // // // // // // // //             lastMessageTime: chat.lastMessageTime || null,
// // // // // // // // //           });
// // // // // // // // //         }

// // // // // // // // //         // 2️⃣ Static contacts based on role
// // // // // // // // //         let staticContacts = [];
// // // // // // // // //         switch (userRole) {
// // // // // // // // //           case "superadmin":
// // // // // // // // //             const hotels = await Hotel.find().select("_id name").lean();
// // // // // // // // //             const branches = await Branch.find().select("_id name").lean();
// // // // // // // // //             const groups = await BranchGroup.find()
// // // // // // // // //               .select("_id userName")
// // // // // // // // //               .lean();
// // // // // // // // //             const valleys = await ValleyBoy.find().select("_id name").lean();
// // // // // // // // //             const appUsers = await User.find()
// // // // // // // // //               .select("_id name phoneNumber")
// // // // // // // // //               .lean();
// // // // // // // // //             staticContacts = [
// // // // // // // // //               ...hotels.map((h) => ({
// // // // // // // // //                 _id: h._id.toString(),
// // // // // // // // //                 role: "hotel",
// // // // // // // // //                 name: h.name,
// // // // // // // // //               })),
// // // // // // // // //               ...branches.map((b) => ({
// // // // // // // // //                 _id: b._id.toString(),
// // // // // // // // //                 role: "branch",
// // // // // // // // //                 name: b.name,
// // // // // // // // //               })),
// // // // // // // // //               ...groups.map((bg) => ({
// // // // // // // // //                 _id: bg._id.toString(),
// // // // // // // // //                 role: "branchgroup",
// // // // // // // // //                 name: bg.userName,
// // // // // // // // //               })),
// // // // // // // // //               ...valleys.map((v) => ({
// // // // // // // // //                 _id: v._id.toString(),
// // // // // // // // //                 role: "valleyboy",
// // // // // // // // //                 name: v.name,
// // // // // // // // //               })),
// // // // // // // // //               ...appUsers.map((u) => ({
// // // // // // // // //                 _id: u._id.toString(),
// // // // // // // // //                 role: "user",
// // // // // // // // //                 name: u.name || u.phoneNumber,
// // // // // // // // //               })),
// // // // // // // // //             ];
// // // // // // // // //             break;

// // // // // // // // //           case "hotel":
// // // // // // // // //             const hotelBranches = await Branch.find({ hotelId: userId })
// // // // // // // // //               .select("_id name")
// // // // // // // // //               .lean();
// // // // // // // // //             staticContacts = [
// // // // // // // // //               ...hotelBranches.map((b) => ({
// // // // // // // // //                 _id: b._id.toString(),
// // // // // // // // //                 role: "branch",
// // // // // // // // //                 name: b.name,
// // // // // // // // //               })),
// // // // // // // // //               {
// // // // // // // // //                 _id: "superadmin-placeholder",
// // // // // // // // //                 role: "superadmin",
// // // // // // // // //                 name: "Super Admin",
// // // // // // // // //               },
// // // // // // // // //             ];
// // // // // // // // //             break;

// // // // // // // // //           case "branch":
// // // // // // // // //             const branchData = await Branch.findById(userId)
// // // // // // // // //               .select("hotelId")
// // // // // // // // //               .lean();
// // // // // // // // //             const hotelInfo = branchData?.hotelId
// // // // // // // // //               ? await Hotel.findById(branchData.hotelId)
// // // // // // // // //                   .select("_id name")
// // // // // // // // //                   .lean()
// // // // // // // // //               : null;
// // // // // // // // //             staticContacts = [
// // // // // // // // //               ...(hotelInfo
// // // // // // // // //                 ? [
// // // // // // // // //                     {
// // // // // // // // //                       _id: hotelInfo._id.toString(),
// // // // // // // // //                       role: "hotel",
// // // // // // // // //                       name: hotelInfo.name,
// // // // // // // // //                     },
// // // // // // // // //                   ]
// // // // // // // // //                 : []),
// // // // // // // // //               {
// // // // // // // // //                 _id: "superadmin-placeholder",
// // // // // // // // //                 role: "superadmin",
// // // // // // // // //                 name: "Super Admin",
// // // // // // // // //               },
// // // // // // // // //             ];
// // // // // // // // //             break;

// // // // // // // // //           case "branchgroup":
// // // // // // // // //             const assignedBranches = await Branch.find({
// // // // // // // // //               _id: { $in: user.AssignedBranch || [] },
// // // // // // // // //             })
// // // // // // // // //               .select("_id name")
// // // // // // // // //               .lean();
// // // // // // // // //             staticContacts = assignedBranches.map((b) => ({
// // // // // // // // //               _id: b._id.toString(),
// // // // // // // // //               role: "branch",
// // // // // // // // //               name: b.name,
// // // // // // // // //             }));
// // // // // // // // //             break;

// // // // // // // // //           case "valleyboy":
// // // // // // // // //             const vbBranch = user.branchId
// // // // // // // // //               ? await Branch.findById(user.branchId).select("_id name").lean()
// // // // // // // // //               : null;
// // // // // // // // //             const vbHotel = !vbBranch
// // // // // // // // //               ? await Hotel.findById(user.hotelId).select("_id name").lean()
// // // // // // // // //               : null;
// // // // // // // // //             staticContacts = [
// // // // // // // // //               ...(vbBranch
// // // // // // // // //                 ? [
// // // // // // // // //                     {
// // // // // // // // //                       _id: vbBranch._id.toString(),
// // // // // // // // //                       role: "branch",
// // // // // // // // //                       name: vbBranch.name,
// // // // // // // // //                     },
// // // // // // // // //                   ]
// // // // // // // // //                 : []),
// // // // // // // // //               ...(vbHotel
// // // // // // // // //                 ? [
// // // // // // // // //                     {
// // // // // // // // //                       _id: vbHotel._id.toString(),
// // // // // // // // //                       role: "hotel",
// // // // // // // // //                       name: vbHotel.name,
// // // // // // // // //                     },
// // // // // // // // //                   ]
// // // // // // // // //                 : []),
// // // // // // // // //             ];
// // // // // // // // //             break;

// // // // // // // // //           case "user":
// // // // // // // // //             const userChats = await Chat.find({
// // // // // // // // //               "participants.userId": userId,
// // // // // // // // //               "participants.userModel": "user",
// // // // // // // // //             }).lean();
// // // // // // // // //             const valleyIds = userChats
// // // // // // // // //               .map((c) =>
// // // // // // // // //                 c.participants.find((p) => p.userModel === "valleyboy")
// // // // // // // // //               )
// // // // // // // // //               .filter(Boolean);
// // // // // // // // //             const valleyInfos = await ValleyBoy.find({
// // // // // // // // //               _id: { $in: valleyIds.map((v) => v.userId) },
// // // // // // // // //             })
// // // // // // // // //               .select("_id name")
// // // // // // // // //               .lean();
// // // // // // // // //             staticContacts = valleyInfos.map((v) => ({
// // // // // // // // //               _id: v._id.toString(),
// // // // // // // // //               role: "valleyboy",
// // // // // // // // //               name: v.name,
// // // // // // // // //             }));
// // // // // // // // //             break;
// // // // // // // // //         }

// // // // // // // // //         // 3️⃣ Merge & deduplicate
// // // // // // // // //         const merged = [...chatContacts, ...staticContacts];
// // // // // // // // //         const unique = [];
// // // // // // // // //         const seen = new Set();
// // // // // // // // //         for (const c of merged) {
// // // // // // // // //           const key = `${c._id}-${c.role}`;
// // // // // // // // //           if (!seen.has(key)) {
// // // // // // // // //             seen.add(key);
// // // // // // // // //             unique.push(c);
// // // // // // // // //           }
// // // // // // // // //         }

// // // // // // // // //         socket.emit("chatList", unique);
// // // // // // // // //       } catch (err) {
// // // // // // // // //         console.error("❌ Error fetching chat list:", err);
// // // // // // // // //         socket.emit("error", { message: "Failed to fetch chat list" });
// // // // // // // // //       }
// // // // // // // // //     });

// // // // // // // // //     // 🏷️ Join Chat
// // // // // // // // //     socket.on("joinChat", async (chatUserId, chatUserRole) => {
// // // // // // // // //       try {
// // // // // // // // //         if (!user) return;
// // // // // // // // //         const senderId = safeObjectId(user.id);
// // // // // // // // //         const receiverId = safeObjectId(chatUserId);
// // // // // // // // //         if (!senderId || !receiverId) return;

// // // // // // // // //         const senderRole = user.role;
// // // // // // // // //         const receiverRole = normalizeRole(chatUserRole);

// // // // // // // // //         let chat = await Chat.findOne({
// // // // // // // // //           participants: {
// // // // // // // // //             $all: [
// // // // // // // // //               { $elemMatch: { userId: senderId, userModel: senderRole } },
// // // // // // // // //               { $elemMatch: { userId: receiverId, userModel: receiverRole } },
// // // // // // // // //             ],
// // // // // // // // //           },
// // // // // // // // //         });

// // // // // // // // //         if (!chat) {
// // // // // // // // //           chat = await Chat.create({
// // // // // // // // //             participants: [
// // // // // // // // //               { userId: senderId, userModel: senderRole },
// // // // // // // // //               { userId: receiverId, userModel: receiverRole },
// // // // // // // // //             ],
// // // // // // // // //           });
// // // // // // // // //         }

// // // // // // // // //         const roomId = chat._id.toString();
// // // // // // // // //         socket.join(roomId);

// // // // // // // // //         const messages = await Message.find({ chatId: roomId })
// // // // // // // // //           .sort({ createdAt: 1 })
// // // // // // // // //           .lean();
// // // // // // // // //         socket.emit("chatHistory", messages);
// // // // // // // // //       } catch (err) {
// // // // // // // // //         console.error("❌ Error joining chat:", err);
// // // // // // // // //       }
// // // // // // // // //     });

// // // // // // // // //     // ✉️ Send Message
// // // // // // // // //     socket.on("sendMessage", async ({ chatUserId, chatUserRole, text }) => {
// // // // // // // // //       try {
// // // // // // // // //         if (!user || !chatUserId || !text) return;

// // // // // // // // //         const senderId = safeObjectId(user.id);
// // // // // // // // //         const receiverId = safeObjectId(chatUserId);
// // // // // // // // //         if (!senderId || !receiverId) return;

// // // // // // // // //         const senderRole = user.role;
// // // // // // // // //         const receiverRole = normalizeRole(chatUserRole);

// // // // // // // // //         let chat = await Chat.findOne({
// // // // // // // // //           participants: {
// // // // // // // // //             $all: [
// // // // // // // // //               { $elemMatch: { userId: senderId, userModel: senderRole } },
// // // // // // // // //               { $elemMatch: { userId: receiverId, userModel: receiverRole } },
// // // // // // // // //             ],
// // // // // // // // //           },
// // // // // // // // //         });

// // // // // // // // //         if (!chat) {
// // // // // // // // //           chat = await Chat.create({
// // // // // // // // //             participants: [
// // // // // // // // //               { userId: senderId, userModel: senderRole },
// // // // // // // // //               { userId: receiverId, userModel: receiverRole },
// // // // // // // // //             ],
// // // // // // // // //           });
// // // // // // // // //         }

// // // // // // // // //         const roomId = chat._id.toString();

// // // // // // // // //         const message = await Message.create({
// // // // // // // // //           chatId: roomId,
// // // // // // // // //           text,
// // // // // // // // //           sender: { userId: senderId, userModel: senderRole },
// // // // // // // // //           deliveredTo: [],
// // // // // // // // //           readBy: [],
// // // // // // // // //         });

// // // // // // // // //         await Chat.findByIdAndUpdate(roomId, {
// // // // // // // // //           lastMessage: text,
// // // // // // // // //           lastMessageTime: new Date(),
// // // // // // // // //         });

// // // // // // // // //         io.to(roomId).emit("newMessage", message);
// // // // // // // // //         console.log(`💬 Message sent to room ${roomId}`);
// // // // // // // // //       } catch (err) {
// // // // // // // // //         console.error("❌ Error sending message:", err);
// // // // // // // // //         socket.emit("error", { message: "Failed to send message" });
// // // // // // // // //       }
// // // // // // // // //     });

// // // // // // // // //     socket.on("disconnect", () => {
// // // // // // // // //       console.log(`❌ Disconnected: ${socket.id}`);
// // // // // // // // //     });
// // // // // // // // //   });
// // // // // // // // // }

// // // // // // // // // module.exports = initSocket;

// // // // // // // // // config/socket.js
// // // // // // // // const { Server } = require("socket.io");
// // // // // // // // const mongoose = require("mongoose");
// // // // // // // // const jwt = require("jsonwebtoken");

// // // // // // // // const Chat = require("../models/chatRoom.model");
// // // // // // // // const Message = require("../models/message.model");
// // // // // // // // const Hotel = require("../models/hotel.model");
// // // // // // // // const Branch = require("../models/branch.model");
// // // // // // // // const BranchGroup = require("../models/branchGroup.model");
// // // // // // // // const ValleyBoy = require("../models/valleyboy.model");
// // // // // // // // const User = require("../models/user.model");
// // // // // // // // const SuperAdmin = require("../models/superAdmin.model");
// // // // // // // // const { normalizeRole } = require("../utils/helper");

// // // // // // // // function initSocket(server) {
// // // // // // // //   const io = new Server(server, {
// // // // // // // //     cors: { origin: "*" }, // allow all origins for testing
// // // // // // // //     transports: ["websocket", "polling"], // support both
// // // // // // // //   });

// // // // // // // //   io.on("connection", (socket) => {
// // // // // // // //     console.log(`✅ New socket connected: ${socket.id}`);
// // // // // // // //     let user = null;

// // // // // // // //     // Authenticate socket
// // // // // // // //     socket.on("credentials", (token) => {
// // // // // // // //       try {
// // // // // // // //         user = jwt.verify(token, process.env.JWT_SECRET);
// // // // // // // //         user.role = normalizeRole(user.role);
// // // // // // // //         console.log(`🔐 Authenticated: ${user.id} (${user.role})`);
// // // // // // // //       } catch (err) {
// // // // // // // //         console.log("❌ Invalid token");
// // // // // // // //         socket.disconnect();
// // // // // // // //       }
// // // // // // // //     });

// // // // // // // //     function safeObjectId(id) {
// // // // // // // //       return mongoose.isValidObjectId(id)
// // // // // // // //         ? new mongoose.Types.ObjectId(id)
// // // // // // // //         : null;
// // // // // // // //     }

// // // // // // // //     // Fetch chat list
// // // // // // // //     socket.on("fetchChatList", async () => {
// // // // // // // //       try {
// // // // // // // //         if (!user) return;
// // // // // // // //         const userId = safeObjectId(user.id);
// // // // // // // //         const userRole = user.role;

// // // // // // // //         // Fetch chats for this user
// // // // // // // //         const chats = await Chat.find({
// // // // // // // //           "participants.userId": userId,
// // // // // // // //           "participants.userModel": userRole,
// // // // // // // //         }).lean();

// // // // // // // //         const contacts = [];

// // // // // // // //         for (const chat of chats) {
// // // // // // // //           const other = chat.participants.find(
// // // // // // // //             (p) => p.userId.toString() !== user.id
// // // // // // // //           );
// // // // // // // //           if (!other) continue;

// // // // // // // //           let name = other.userModel;
// // // // // // // //           switch (other.userModel.toLowerCase()) {
// // // // // // // //             case "hotel":
// // // // // // // //               const h = safeObjectId(other.userId)
// // // // // // // //                 ? await Hotel.findById(other.userId).select("name").lean()
// // // // // // // //                 : null;
// // // // // // // //               name = h?.name || "Hotel";
// // // // // // // //               break;
// // // // // // // //             case "branch":
// // // // // // // //               const b = safeObjectId(other.userId)
// // // // // // // //                 ? await Branch.findById(other.userId).select("name").lean()
// // // // // // // //                 : null;
// // // // // // // //               name = b?.name || "Branch";
// // // // // // // //               break;
// // // // // // // //             case "branchgroup":
// // // // // // // //               const bg = safeObjectId(other.userId)
// // // // // // // //                 ? await BranchGroup.findById(other.userId)
// // // // // // // //                     .select("userName")
// // // // // // // //                     .lean()
// // // // // // // //                 : null;
// // // // // // // //               name = bg?.userName || "Branch Group";
// // // // // // // //               break;
// // // // // // // //             case "valleyboy":
// // // // // // // //               const v = safeObjectId(other.userId)
// // // // // // // //                 ? await ValleyBoy.findById(other.userId).select("name").lean()
// // // // // // // //                 : null;
// // // // // // // //               name = v?.name || "Valley Boy";
// // // // // // // //               break;
// // // // // // // //             case "user":
// // // // // // // //               const u = safeObjectId(other.userId)
// // // // // // // //                 ? await User.findById(other.userId)
// // // // // // // //                     .select("name phoneNumber")
// // // // // // // //                     .lean()
// // // // // // // //                 : null;
// // // // // // // //               name = u?.name || u?.phoneNumber || "User";
// // // // // // // //               break;
// // // // // // // //             case "superadmin":
// // // // // // // //               const sa = safeObjectId(other.userId)
// // // // // // // //                 ? await SuperAdmin.findById(other.userId)
// // // // // // // //                     .select("username")
// // // // // // // //                     .lean()
// // // // // // // //                 : null;
// // // // // // // //               name = sa?.username || "Super Admin";
// // // // // // // //               break;
// // // // // // // //           }

// // // // // // // //           contacts.push({
// // // // // // // //             _id: other.userId.toString(),
// // // // // // // //             role: other.userModel.toLowerCase(),
// // // // // // // //             name,
// // // // // // // //             lastMessage: chat.lastMessage || "",
// // // // // // // //             lastMessageTime: chat.lastMessageTime || null,
// // // // // // // //           });
// // // // // // // //         }

// // // // // // // //         socket.emit("chatList", contacts);
// // // // // // // //       } catch (err) {
// // // // // // // //         console.error(err);
// // // // // // // //         socket.emit("error", { message: "Failed to fetch chat list" });
// // // // // // // //       }
// // // // // // // //     });

// // // // // // // //     // Join chat room
// // // // // // // //     socket.on("joinChat", async (chatUserId, chatUserRole) => {
// // // // // // // //       try {
// // // // // // // //         if (!user) return;
// // // // // // // //         const senderId = safeObjectId(user.id);
// // // // // // // //         const receiverId = safeObjectId(chatUserId);
// // // // // // // //         if (!senderId || !receiverId) return;

// // // // // // // //         const senderRole = user.role;
// // // // // // // //         const receiverRole = normalizeRole(chatUserRole);

// // // // // // // //         let chat = await Chat.findOne({
// // // // // // // //           participants: {
// // // // // // // //             $all: [
// // // // // // // //               { $elemMatch: { userId: senderId, userModel: senderRole } },
// // // // // // // //               { $elemMatch: { userId: receiverId, userModel: receiverRole } },
// // // // // // // //             ],
// // // // // // // //           },
// // // // // // // //         });

// // // // // // // //         if (!chat) {
// // // // // // // //           chat = await Chat.create({
// // // // // // // //             participants: [
// // // // // // // //               { userId: senderId, userModel: senderRole },
// // // // // // // //               { userId: receiverId, userModel: receiverRole },
// // // // // // // //             ],
// // // // // // // //           });
// // // // // // // //         }

// // // // // // // //         const roomId = chat._id.toString();
// // // // // // // //         socket.join(roomId);

// // // // // // // //         const messages = await Message.find({ chatId: roomId })
// // // // // // // //           .sort({ createdAt: 1 })
// // // // // // // //           .lean();
// // // // // // // //         socket.emit("chatHistory", messages);
// // // // // // // //       } catch (err) {
// // // // // // // //         console.error(err);
// // // // // // // //       }
// // // // // // // //     });

// // // // // // // //     // Send message
// // // // // // // //     socket.on("sendMessage", async ({ chatUserId, chatUserRole, text }) => {
// // // // // // // //       try {
// // // // // // // //         if (!user || !chatUserId || !text) return;

// // // // // // // //         const senderId = safeObjectId(user.id);
// // // // // // // //         const receiverId = safeObjectId(chatUserId);
// // // // // // // //         if (!senderId || !receiverId) return;

// // // // // // // //         const senderRole = user.role;
// // // // // // // //         const receiverRole = normalizeRole(chatUserRole);

// // // // // // // //         let chat = await Chat.findOne({
// // // // // // // //           participants: {
// // // // // // // //             $all: [
// // // // // // // //               { $elemMatch: { userId: senderId, userModel: senderRole } },
// // // // // // // //               { $elemMatch: { userId: receiverId, userModel: receiverRole } },
// // // // // // // //             ],
// // // // // // // //           },
// // // // // // // //         });

// // // // // // // //         if (!chat) {
// // // // // // // //           chat = await Chat.create({
// // // // // // // //             participants: [
// // // // // // // //               { userId: senderId, userModel: senderRole },
// // // // // // // //               { userId: receiverId, userModel: receiverRole },
// // // // // // // //             ],
// // // // // // // //           });
// // // // // // // //         }

// // // // // // // //         const roomId = chat._id.toString();

// // // // // // // //         const message = await Message.create({
// // // // // // // //           chatId: roomId,
// // // // // // // //           text,
// // // // // // // //           sender: { userId: senderId, userModel: senderRole },
// // // // // // // //           deliveredTo: [],
// // // // // // // //           readBy: [],
// // // // // // // //         });

// // // // // // // //         await Chat.findByIdAndUpdate(roomId, {
// // // // // // // //           lastMessage: text,
// // // // // // // //           lastMessageTime: new Date(),
// // // // // // // //         });

// // // // // // // //         io.to(roomId).emit("newMessage", message);
// // // // // // // //       } catch (err) {
// // // // // // // //         console.error(err);
// // // // // // // //         socket.emit("error", { message: "Failed to send message" });
// // // // // // // //       }
// // // // // // // //     });

// // // // // // // //     socket.on("disconnect", () => {
// // // // // // // //       console.log(`❌ Disconnected: ${socket.id}`);
// // // // // // // //     });
// // // // // // // //   });
// // // // // // // // }

// // // // // // // // module.exports = initSocket;

// // // // // // // const { Server } = require("socket.io");
// // // // // // // const mongoose = require("mongoose");
// // // // // // // const jwt = require("jsonwebtoken");

// // // // // // // const Chat = require("../models/chatRoom.model");
// // // // // // // const Message = require("../models/message.model");
// // // // // // // const Hotel = require("../models/hotel.model");
// // // // // // // const Branch = require("../models/branch.model");
// // // // // // // const BranchGroup = require("../models/branchGroup.model");
// // // // // // // const ValleyBoy = require("../models/valleyboy.model");
// // // // // // // const User = require("../models/user.model");
// // // // // // // const SuperAdmin = require("../models/superAdmin.model");
// // // // // // // const { normalizeRole } = require("../utils/helper");

// // // // // // // function initSocket(server) {
// // // // // // //   const io = new Server(server, {
// // // // // // //     cors: { origin: "*" }, // allow all origins
// // // // // // //     transports: ["websocket", "polling"], // fallback polling
// // // // // // //   });

// // // // // // //   io.on("connection", (socket) => {
// // // // // // //     console.log(`✅ New socket connected: ${socket.id}`);
// // // // // // //     let user = null;

// // // // // // //     // Authenticate socket
// // // // // // //     socket.on("credentials", (token) => {
// // // // // // //       try {
// // // // // // //         user = jwt.verify(token, process.env.JWT_SECRET);
// // // // // // //         user.role = normalizeRole(user.role);
// // // // // // //         console.log(`🔐 Authenticated: ${user.id} (${user.role})`);
// // // // // // //       } catch (err) {
// // // // // // //         console.log("❌ Invalid token", err.message);
// // // // // // //         socket.emit("error", { message: "Invalid token" });
// // // // // // //         socket.disconnect(true);
// // // // // // //       }
// // // // // // //     });

// // // // // // //     function safeObjectId(id) {
// // // // // // //       return mongoose.isValidObjectId(id)
// // // // // // //         ? new mongoose.Types.ObjectId(id)
// // // // // // //         : null;
// // // // // // //     }

// // // // // // //     // Fetch chat list
// // // // // // //     socket.on("fetchChatList", async () => {
// // // // // // //       try {
// // // // // // //         if (!user) return;
// // // // // // //         const userId = safeObjectId(user.id);
// // // // // // //         const userRole = user.role;

// // // // // // //         const chats = await Chat.find({
// // // // // // //           participants: { $elemMatch: { userId, userModel: userRole } },
// // // // // // //         }).lean();

// // // // // // //         const contacts = [];

// // // // // // //         for (const chat of chats) {
// // // // // // //           const other = chat.participants.find(
// // // // // // //             (p) => p.userId.toString() !== user.id
// // // // // // //           );
// // // // // // //           if (!other) continue;

// // // // // // //           let name = other.userModel;
// // // // // // //           switch (other.userModel.toLowerCase()) {
// // // // // // //             case "hotel":
// // // // // // //               const h = safeObjectId(other.userId)
// // // // // // //                 ? await Hotel.findById(other.userId).select("name").lean()
// // // // // // //                 : null;
// // // // // // //               name = h?.name || "Hotel";
// // // // // // //               break;
// // // // // // //             case "branch":
// // // // // // //               const b = safeObjectId(other.userId)
// // // // // // //                 ? await Branch.findById(other.userId).select("name").lean()
// // // // // // //                 : null;
// // // // // // //               name = b?.name || "Branch";
// // // // // // //               break;
// // // // // // //             case "branchgroup":
// // // // // // //               const bg = safeObjectId(other.userId)
// // // // // // //                 ? await BranchGroup.findById(other.userId)
// // // // // // //                     .select("userName")
// // // // // // //                     .lean()
// // // // // // //                 : null;
// // // // // // //               name = bg?.userName || "Branch Group";
// // // // // // //               break;
// // // // // // //             case "valleyboy":
// // // // // // //               const v = safeObjectId(other.userId)
// // // // // // //                 ? await ValleyBoy.findById(other.userId).select("name").lean()
// // // // // // //                 : null;
// // // // // // //               name = v?.name || "Valley Boy";
// // // // // // //               break;
// // // // // // //             case "user":
// // // // // // //               const u = safeObjectId(other.userId)
// // // // // // //                 ? await User.findById(other.userId)
// // // // // // //                     .select("name phoneNumber")
// // // // // // //                     .lean()
// // // // // // //                 : null;
// // // // // // //               name = u?.name || u?.phoneNumber || "User";
// // // // // // //               break;
// // // // // // //             case "superadmin":
// // // // // // //               const sa = safeObjectId(other.userId)
// // // // // // //                 ? await SuperAdmin.findById(other.userId)
// // // // // // //                     .select("username")
// // // // // // //                     .lean()
// // // // // // //                 : null;
// // // // // // //               name = sa?.username || "Super Admin";
// // // // // // //               break;
// // // // // // //           }

// // // // // // //           contacts.push({
// // // // // // //             _id: other.userId.toString(),
// // // // // // //             role: other.userModel.toLowerCase(),
// // // // // // //             name,
// // // // // // //             lastMessage: chat.lastMessage || "",
// // // // // // //             lastMessageTime: chat.lastMessageTime || null,
// // // // // // //           });
// // // // // // //         }

// // // // // // //         socket.emit("chatList", contacts);
// // // // // // //       } catch (err) {
// // // // // // //         console.error(err);
// // // // // // //         socket.emit("error", { message: "Failed to fetch chat list" });
// // // // // // //       }
// // // // // // //     });

// // // // // // //     // Join chat
// // // // // // //     socket.on("joinChat", async (chatUserId, chatUserRole) => {
// // // // // // //       if (!user) return;
// // // // // // //       const senderId = safeObjectId(user.id);
// // // // // // //       const receiverId = safeObjectId(chatUserId);
// // // // // // //       if (!senderId || !receiverId) return;

// // // // // // //       const senderRole = user.role;
// // // // // // //       const receiverRole = normalizeRole(chatUserRole);

// // // // // // //       let chat = await Chat.findOne({
// // // // // // //         participants: {
// // // // // // //           $all: [
// // // // // // //             { $elemMatch: { userId: senderId, userModel: senderRole } },
// // // // // // //             { $elemMatch: { userId: receiverId, userModel: receiverRole } },
// // // // // // //           ],
// // // // // // //         },
// // // // // // //       });

// // // // // // //       if (!chat) {
// // // // // // //         chat = await Chat.create({
// // // // // // //           participants: [
// // // // // // //             { userId: senderId, userModel: senderRole },
// // // // // // //             { userId: receiverId, userModel: receiverRole },
// // // // // // //           ],
// // // // // // //         });
// // // // // // //       }

// // // // // // //       const roomId = chat._id.toString();
// // // // // // //       socket.join(roomId);

// // // // // // //       const messages = await Message.find({ chatId: roomId })
// // // // // // //         .sort({ createdAt: 1 })
// // // // // // //         .lean();
// // // // // // //       socket.emit("chatHistory", messages);
// // // // // // //     });

// // // // // // //     // Send message
// // // // // // //     socket.on("sendMessage", async ({ chatUserId, chatUserRole, text }) => {
// // // // // // //       if (!user || !chatUserId || !text) return;

// // // // // // //       const senderId = safeObjectId(user.id);
// // // // // // //       const receiverId = safeObjectId(chatUserId);
// // // // // // //       if (!senderId || !receiverId) return;

// // // // // // //       const senderRole = user.role;
// // // // // // //       const receiverRole = normalizeRole(chatUserRole);

// // // // // // //       let chat = await Chat.findOne({
// // // // // // //         participants: {
// // // // // // //           $all: [
// // // // // // //             { $elemMatch: { userId: senderId, userModel: senderRole } },
// // // // // // //             { $elemMatch: { userId: receiverId, userModel: receiverRole } },
// // // // // // //           ],
// // // // // // //         },
// // // // // // //       });

// // // // // // //       if (!chat) {
// // // // // // //         chat = await Chat.create({
// // // // // // //           participants: [
// // // // // // //             { userId: senderId, userModel: senderRole },
// // // // // // //             { userId: receiverId, userModel: receiverRole },
// // // // // // //           ],
// // // // // // //         });
// // // // // // //       }

// // // // // // //       const roomId = chat._id.toString();

// // // // // // //       const message = await Message.create({
// // // // // // //         chatId: roomId,
// // // // // // //         text,
// // // // // // //         sender: { userId: senderId, userModel: senderRole },
// // // // // // //         deliveredTo: [],
// // // // // // //         readBy: [],
// // // // // // //       });

// // // // // // //       await Chat.findByIdAndUpdate(roomId, {
// // // // // // //         lastMessage: text,
// // // // // // //         lastMessageTime: new Date(),
// // // // // // //       });

// // // // // // //       io.to(roomId).emit("newMessage", message);
// // // // // // //     });

// // // // // // //     socket.on("disconnect", () => {
// // // // // // //       console.log(`❌ Disconnected: ${socket.id}`);
// // // // // // //     });
// // // // // // //   });
// // // // // // // }

// // // // // // // module.exports = initSocket;

// // // // // // const { Server } = require("socket.io");
// // // // // // const mongoose = require("mongoose");
// // // // // // const jwt = require("jsonwebtoken");

// // // // // // const Chat = require("../models/chatRoom.model");
// // // // // // const Message = require("../models/message.model");
// // // // // // const Hotel = require("../models/hotel.model");
// // // // // // const Branch = require("../models/branch.model");
// // // // // // const BranchGroup = require("../models/branchGroup.model");
// // // // // // const ValleyBoy = require("../models/valleyboy.model");
// // // // // // const User = require("../models/user.model");
// // // // // // const SuperAdmin = require("../models/superAdmin.model");

// // // // // // // Map numeric roles from JWT to string roles used in DB
// // // // // // function normalizeRole(role) {
// // // // // //   switch (role) {
// // // // // //     case 1:
// // // // // //       return "superadmin";
// // // // // //     case 2:
// // // // // //       return "hotel";
// // // // // //     case 3:
// // // // // //       return "branch";
// // // // // //     case 4:
// // // // // //       return "branchgroup";
// // // // // //     case 5:
// // // // // //       return "valleyboy";
// // // // // //     case 6:
// // // // // //       return "user";
// // // // // //     default:
// // // // // //       return "user";
// // // // // //   }
// // // // // // }

// // // // // // // Safe ObjectId helper
// // // // // // function safeObjectId(id) {
// // // // // //   return mongoose.isValidObjectId(id) ? new mongoose.Types.ObjectId(id) : null;
// // // // // // }

// // // // // // function initSocket(server) {
// // // // // //   const io = new Server(server, {
// // // // // //     cors: { origin: "*" },
// // // // // //     transports: ["websocket", "polling"],
// // // // // //   });

// // // // // //   io.on("connection", (socket) => {
// // // // // //     console.log(`✅ New socket connected: ${socket.id}`);
// // // // // //     let user = null;

// // // // // //     // 🔐 Authenticate socket
// // // // // //     socket.on("credentials", (token) => {
// // // // // //       try {
// // // // // //         user = jwt.verify(token, process.env.JWT_SECRET);
// // // // // //         user.role = normalizeRole(user.role);
// // // // // //         console.log(`🔐 Authenticated user: ${user.id} (${user.role})`);
// // // // // //       } catch (err) {
// // // // // //         console.log("❌ Invalid token", err.message);
// // // // // //         socket.disconnect();
// // // // // //       }
// // // // // //     });

// // // // // //     // 📨 Fetch chat list
// // // // // //     socket.on("fetchChatList", async () => {
// // // // // //       try {
// // // // // //         if (!user) return;

// // // // // //         const userId = safeObjectId(user.id);
// // // // // //         const userRole = user.role;

// // // // // //         // 1️⃣ Fetch chats where user is participant
// // // // // //         const chats = await Chat.find({
// // // // // //           participants: { $elemMatch: { userId, userModel: userRole } },
// // // // // //         }).lean();

// // // // // //         const contacts = [];

// // // // // //         for (const chat of chats) {
// // // // // //           const other = chat.participants.find(
// // // // // //             (p) => p.userId.toString() !== user.id
// // // // // //           );
// // // // // //           if (!other) continue;

// // // // // //           let name = other.userModel;

// // // // // //           switch (other.userModel.toLowerCase()) {
// // // // // //             case "hotel":
// // // // // //               const h = safeObjectId(other.userId)
// // // // // //                 ? await Hotel.findById(other.userId).select("name").lean()
// // // // // //                 : null;
// // // // // //               name = h?.name || "Hotel";
// // // // // //               break;
// // // // // //             case "branch":
// // // // // //               const b = safeObjectId(other.userId)
// // // // // //                 ? await Branch.findById(other.userId).select("name").lean()
// // // // // //                 : null;
// // // // // //               name = b?.name || "Branch";
// // // // // //               break;
// // // // // //             case "branchgroup":
// // // // // //               const bg = safeObjectId(other.userId)
// // // // // //                 ? await BranchGroup.findById(other.userId)
// // // // // //                     .select("userName")
// // // // // //                     .lean()
// // // // // //                 : null;
// // // // // //               name = bg?.userName || "Branch Group";
// // // // // //               break;
// // // // // //             case "valleyboy":
// // // // // //               const v = safeObjectId(other.userId)
// // // // // //                 ? await ValleyBoy.findById(other.userId).select("name").lean()
// // // // // //                 : null;
// // // // // //               name = v?.name || "Valley Boy";
// // // // // //               break;
// // // // // //             case "user":
// // // // // //               const u = safeObjectId(other.userId)
// // // // // //                 ? await User.findById(other.userId)
// // // // // //                     .select("name phoneNumber")
// // // // // //                     .lean()
// // // // // //                 : null;
// // // // // //               name = u?.name || u?.phoneNumber || "User";
// // // // // //               break;
// // // // // //             case "superadmin":
// // // // // //               const sa = safeObjectId(other.userId)
// // // // // //                 ? await SuperAdmin.findById(other.userId)
// // // // // //                     .select("username")
// // // // // //                     .lean()
// // // // // //                 : null;
// // // // // //               name = sa?.username || "Super Admin";
// // // // // //               break;
// // // // // //           }

// // // // // //           contacts.push({
// // // // // //             _id: other.userId.toString(),
// // // // // //             role: other.userModel.toLowerCase(),
// // // // // //             name,
// // // // // //             lastMessage: chat.lastMessage || "",
// // // // // //             lastMessageTime: chat.lastMessageTime || null,
// // // // // //           });
// // // // // //         }

// // // // // //         // 2️⃣ Optional: fetch static contacts based on role (like branch under hotel, etc.)
// // // // // //         // You can add extra logic here if needed

// // // // // //         socket.emit("chatList", contacts);
// // // // // //         console.log("📨 Sent chat list:", contacts.length, "contacts");
// // // // // //       } catch (err) {
// // // // // //         console.error("❌ Failed to fetch chat list:", err);
// // // // // //         socket.emit("error", { message: "Failed to fetch chat list" });
// // // // // //       }
// // // // // //     });

// // // // // //     // 🏷️ Join chat
// // // // // //     socket.on("joinChat", async (chatUserId, chatUserRole) => {
// // // // // //       try {
// // // // // //         if (!user) return;

// // // // // //         const senderId = safeObjectId(user.id);
// // // // // //         const receiverId = safeObjectId(chatUserId);
// // // // // //         if (!senderId || !receiverId) return;

// // // // // //         const senderRole = user.role;
// // // // // //         const receiverRole = normalizeRole(chatUserRole);

// // // // // //         let chat = await Chat.findOne({
// // // // // //           participants: {
// // // // // //             $all: [
// // // // // //               { $elemMatch: { userId: senderId, userModel: senderRole } },
// // // // // //               { $elemMatch: { userId: receiverId, userModel: receiverRole } },
// // // // // //             ],
// // // // // //           },
// // // // // //         });

// // // // // //         if (!chat) {
// // // // // //           chat = await Chat.create({
// // // // // //             participants: [
// // // // // //               { userId: senderId, userModel: senderRole },
// // // // // //               { userId: receiverId, userModel: receiverRole },
// // // // // //             ],
// // // // // //           });
// // // // // //         }

// // // // // //         const roomId = chat._id.toString();
// // // // // //         socket.join(roomId);

// // // // // //         const messages = await Message.find({ chatId: roomId })
// // // // // //           .sort({ createdAt: 1 })
// // // // // //           .lean();

// // // // // //         socket.emit("chatHistory", messages);
// // // // // //       } catch (err) {
// // // // // //         console.error("❌ Error joining chat:", err);
// // // // // //       }
// // // // // //     });

// // // // // //     // ✉️ Send message
// // // // // //     socket.on("sendMessage", async ({ chatUserId, chatUserRole, text }) => {
// // // // // //       try {
// // // // // //         if (!user || !chatUserId || !text) return;

// // // // // //         const senderId = safeObjectId(user.id);
// // // // // //         const receiverId = safeObjectId(chatUserId);
// // // // // //         if (!senderId || !receiverId) return;

// // // // // //         const senderRole = user.role;
// // // // // //         const receiverRole = normalizeRole(chatUserRole);

// // // // // //         let chat = await Chat.findOne({
// // // // // //           participants: {
// // // // // //             $all: [
// // // // // //               { $elemMatch: { userId: senderId, userModel: senderRole } },
// // // // // //               { $elemMatch: { userId: receiverId, userModel: receiverRole } },
// // // // // //             ],
// // // // // //           },
// // // // // //         });

// // // // // //         if (!chat) {
// // // // // //           chat = await Chat.create({
// // // // // //             participants: [
// // // // // //               { userId: senderId, userModel: senderRole },
// // // // // //               { userId: receiverId, userModel: receiverRole },
// // // // // //             ],
// // // // // //           });
// // // // // //         }

// // // // // //         const roomId = chat._id.toString();

// // // // // //         const message = await Message.create({
// // // // // //           chatId: roomId,
// // // // // //           text,
// // // // // //           sender: { userId: senderId, userModel: senderRole },
// // // // // //           deliveredTo: [],
// // // // // //           readBy: [],
// // // // // //         });

// // // // // //         await Chat.findByIdAndUpdate(roomId, {
// // // // // //           lastMessage: text,
// // // // // //           lastMessageTime: new Date(),
// // // // // //         });

// // // // // //         io.to(roomId).emit("newMessage", message);
// // // // // //       } catch (err) {
// // // // // //         console.error("❌ Error sending message:", err);
// // // // // //         socket.emit("error", { message: "Failed to send message" });
// // // // // //       }
// // // // // //     });

// // // // // //     socket.on("disconnect", () => {
// // // // // //       console.log(`❌ Disconnected: ${socket.id}`);
// // // // // //     });
// // // // // //   });
// // // // // // }

// // // // // // module.exports = initSocket;

// // // // // const { Server } = require("socket.io");
// // // // // const mongoose = require("mongoose");
// // // // // const jwt = require("jsonwebtoken");

// // // // // const Chat = require("../models/chatRoom.model");
// // // // // const Message = require("../models/message.model");
// // // // // const Hotel = require("../models/hotel.model");
// // // // // const Branch = require("../models/branch.model");
// // // // // const BranchGroup = require("../models/branchGroup.model");
// // // // // const ValleyBoy = require("../models/valleyboy.model");
// // // // // const User = require("../models/user.model");
// // // // // const SuperAdmin = require("../models/superAdmin.model");
// // // // // const { normalizeRole } = require("../utils/helper");

// // // // // function initSocket(server) {
// // // // //   const io = new Server(server, {
// // // // //     cors: { origin: "*" },
// // // // //     transports: ["websocket", "polling"],
// // // // //   });

// // // // //   io.on("connection", (socket) => {
// // // // //     console.log(`✅ New socket connected: ${socket.id}`);
// // // // //     let user = null;

// // // // //     // Authenticate socket
// // // // //     socket.on("credentials", (token) => {
// // // // //       try {
// // // // //         console.log("🔑 Token received:", token);
// // // // //         user = jwt.verify(token, process.env.JWT_SECRET);
// // // // //         user.role = normalizeRole(user.role);
// // // // //         console.log(`🔐 Authenticated: ${user.id} (${user.role})`);
// // // // //       } catch (err) {
// // // // //         console.log("❌ Invalid token");
// // // // //         socket.disconnect();
// // // // //       }
// // // // //     });

// // // // //     function safeObjectId(id) {
// // // // //       return mongoose.isValidObjectId(id)
// // // // //         ? new mongoose.Types.ObjectId(id)
// // // // //         : null;
// // // // //     }

// // // // //     socket.on("fetchChatList", async () => {
// // // // //       try {
// // // // //         if (!user) return console.log("⛔ User not authenticated yet.");
// // // // //         const userId = safeObjectId(user.id);
// // // // //         const userRole = user.role;

// // // // //         const chats = await Chat.find({
// // // // //           "participants.userId": userId,
// // // // //           "participants.userModel": userRole,
// // // // //         }).lean();

// // // // //         const contacts = [];

// // // // //         for (const chat of chats) {
// // // // //           const other = chat.participants.find(
// // // // //             (p) => p.userId.toString() !== user.id
// // // // //           );
// // // // //           if (!other) continue;

// // // // //           let name = other.userModel;
// // // // //           switch (other.userModel.toLowerCase()) {
// // // // //             case "hotel":
// // // // //               const h = await Hotel.findById(other.userId)
// // // // //                 .select("name")
// // // // //                 .lean();
// // // // //               name = h?.name || "Hotel";
// // // // //               break;
// // // // //             case "branch":
// // // // //               const b = await Branch.findById(other.userId)
// // // // //                 .select("name")
// // // // //                 .lean();
// // // // //               name = b?.name || "Branch";
// // // // //               break;
// // // // //             case "branchgroup":
// // // // //               const bg = await BranchGroup.findById(other.userId)
// // // // //                 .select("userName")
// // // // //                 .lean();
// // // // //               name = bg?.userName || "Branch Group";
// // // // //               break;
// // // // //             case "valleyboy":
// // // // //               const v = await ValleyBoy.findById(other.userId)
// // // // //                 .select("name")
// // // // //                 .lean();
// // // // //               name = v?.name || "Valley Boy";
// // // // //               break;
// // // // //             case "user":
// // // // //               const u = await User.findById(other.userId)
// // // // //                 .select("name phoneNumber")
// // // // //                 .lean();
// // // // //               name = u?.name || u?.phoneNumber || "User";
// // // // //               break;
// // // // //             case "superadmin":
// // // // //               const sa = await SuperAdmin.findById(other.userId)
// // // // //                 .select("username")
// // // // //                 .lean();
// // // // //               name = sa?.username || "Super Admin";
// // // // //               break;
// // // // //           }

// // // // //           contacts.push({
// // // // //             _id: other.userId.toString(),
// // // // //             role: other.userModel.toLowerCase(),
// // // // //             name,
// // // // //             lastMessage: chat.lastMessage || "",
// // // // //             lastMessageTime: chat.lastMessageTime || null,
// // // // //           });
// // // // //         }

// // // // //         socket.emit("chatList", contacts);
// // // // //       } catch (err) {
// // // // //         console.error("❌ Error fetching chat list:", err);
// // // // //         socket.emit("error", { message: "Failed to fetch chat list" });
// // // // //       }
// // // // //     });

// // // // //     socket.on("disconnect", () => {
// // // // //       console.log(`❌ Disconnected: ${socket.id}`);
// // // // //     });
// // // // //   });
// // // // // }

// // // // // module.exports = initSocket;

// // // // const { Server } = require("socket.io");
// // // // const mongoose = require("mongoose");
// // // // const jwt = require("jsonwebtoken");

// // // // const Chat = require("../models/chatRoom.model");
// // // // const Message = require("../models/message.model");
// // // // const Hotel = require("../models/hotel.model");
// // // // const Branch = require("../models/branch.model");
// // // // const BranchGroup = require("../models/branchGroup.model");
// // // // const ValleyBoy = require("../models/valleyboy.model");
// // // // const User = require("../models/user.model");
// // // // const SuperAdmin = require("../models/superAdmin.model");
// // // // const { normalizeRole } = require("../utils/helper");

// // // // function initSocket(server) {
// // // //   const io = new Server(server, {
// // // //     cors: { origin: "*" },
// // // //     transports: ["websocket", "polling"],
// // // //   });

// // // //   io.on("connection", (socket) => {
// // // //     console.log(`✅ New socket connected: ${socket.id}`);
// // // //     let user = null;

// // // //     // Authenticate user
// // // //     socket.on("credentials", (token) => {
// // // //       try {
// // // //         user = jwt.verify(token, process.env.JWT_SECRET);
// // // //         user.role = normalizeRole(user.role);
// // // //         console.log(`🔐 Authenticated: ${user.id} (${user.role})`);
// // // //         socket.emit("authSuccess", { message: "Authenticated" });
// // // //       } catch (err) {
// // // //         console.log("❌ Invalid token");
// // // //         socket.emit("authError", { message: "Invalid token" });
// // // //         socket.disconnect();
// // // //       }
// // // //     });

// // // //     function safeObjectId(id) {
// // // //       return mongoose.isValidObjectId(id)
// // // //         ? new mongoose.Types.ObjectId(id)
// // // //         : null;
// // // //     }

// // // //     // Fetch chat list
// // // //     socket.on("fetchChatList", async () => {
// // // //       if (!user) return socket.emit("error", { message: "Not authenticated" });
// // // //       const userId = safeObjectId(user.id);
// // // //       const userRole = user.role;
// // // //       try {
// // // //         const chats = await Chat.find({
// // // //           "participants.userId": userId,
// // // //           "participants.userModel": userRole,
// // // //         }).lean();

// // // //         const contacts = [];
// // // //         for (const chat of chats) {
// // // //           const other = chat.participants.find(
// // // //             (p) => p.userId.toString() !== user.id
// // // //           );
// // // //           if (!other) continue;

// // // //           let name = other.userModel;
// // // //           switch (other.userModel.toLowerCase()) {
// // // //             case "hotel":
// // // //               const h = await Hotel.findById(other.userId)
// // // //                 .select("name")
// // // //                 .lean();
// // // //               name = h?.name || "Hotel";
// // // //               break;
// // // //             case "branch":
// // // //               const b = await Branch.findById(other.userId)
// // // //                 .select("name")
// // // //                 .lean();
// // // //               name = b?.name || "Branch";
// // // //               break;
// // // //             case "branchgroup":
// // // //               const bg = await BranchGroup.findById(other.userId)
// // // //                 .select("userName")
// // // //                 .lean();
// // // //               name = bg?.userName || "Branch Group";
// // // //               break;
// // // //             case "valleyboy":
// // // //               const v = await ValleyBoy.findById(other.userId)
// // // //                 .select("name")
// // // //                 .lean();
// // // //               name = v?.name || "Valley Boy";
// // // //               break;
// // // //             case "user":
// // // //               const u = await User.findById(other.userId)
// // // //                 .select("name phoneNumber")
// // // //                 .lean();
// // // //               name = u?.name || u?.phoneNumber || "User";
// // // //               break;
// // // //             case "superadmin":
// // // //               const sa = await SuperAdmin.findById(other.userId)
// // // //                 .select("username")
// // // //                 .lean();
// // // //               name = sa?.username || "Super Admin";
// // // //               break;
// // // //           }

// // // //           contacts.push({
// // // //             _id: other.userId.toString(),
// // // //             role: other.userModel.toLowerCase(),
// // // //             name,
// // // //           });
// // // //         }

// // // //         socket.emit("chatList", contacts);
// // // //       } catch (err) {
// // // //         console.error(err);
// // // //         socket.emit("error", { message: "Failed to fetch chat list" });
// // // //       }
// // // //     });

// // // //     // Join chat
// // // //     socket.on("joinChat", async (chatUserId, chatUserRole) => {
// // // //       if (!user) return;
// // // //       const senderId = safeObjectId(user.id);
// // // //       const receiverId = safeObjectId(chatUserId);
// // // //       const receiverRole = normalizeRole(chatUserRole);

// // // //       let chat = await Chat.findOne({
// // // //         participants: {
// // // //           $all: [
// // // //             { $elemMatch: { userId: senderId, userModel: user.role } },
// // // //             { $elemMatch: { userId: receiverId, userModel: receiverRole } },
// // // //           ],
// // // //         },
// // // //       });

// // // //       if (!chat) {
// // // //         chat = await Chat.create({
// // // //           participants: [
// // // //             { userId: senderId, userModel: user.role },
// // // //             { userId: receiverId, userModel: receiverRole },
// // // //           ],
// // // //         });
// // // //       }

// // // //       const roomId = chat._id.toString();
// // // //       socket.join(roomId);
// // // //       const messages = await Message.find({ chatId: roomId })
// // // //         .sort({ createdAt: 1 })
// // // //         .lean();
// // // //       socket.emit("chatHistory", messages);
// // // //     });

// // // //     // Send message
// // // //     socket.on("sendMessage", async ({ chatUserId, chatUserRole, text }) => {
// // // //       if (!user) return;
// // // //       const senderId = safeObjectId(user.id);
// // // //       const receiverId = safeObjectId(chatUserId);
// // // //       const receiverRole = normalizeRole(chatUserRole);

// // // //       let chat = await Chat.findOne({
// // // //         participants: {
// // // //           $all: [
// // // //             { $elemMatch: { userId: senderId, userModel: user.role } },
// // // //             { $elemMatch: { userId: receiverId, userModel: receiverRole } },
// // // //           ],
// // // //         },
// // // //       });

// // // //       if (!chat) {
// // // //         chat = await Chat.create({
// // // //           participants: [
// // // //             { userId: senderId, userModel: user.role },
// // // //             { userId: receiverId, userModel: receiverRole },
// // // //           ],
// // // //         });
// // // //       }

// // // //       const roomId = chat._id.toString();
// // // //       const message = await Message.create({
// // // //         chatId: roomId,
// // // //         text,
// // // //         sender: { userId: senderId, userModel: user.role },
// // // //         deliveredTo: [],
// // // //         readBy: [],
// // // //       });

// // // //       await Chat.findByIdAndUpdate(roomId, {
// // // //         lastMessage: text,
// // // //         lastMessageTime: new Date(),
// // // //       });
// // // //       io.to(roomId).emit("newMessage", message);
// // // //     });

// // // //     socket.on("disconnect", () => {
// // // //       console.log(`❌ Disconnected: ${socket.id}`);
// // // //     });
// // // //   });
// // // // }

// // // // module.exports = initSocket;

// // // const { Server } = require("socket.io");
// // // const mongoose = require("mongoose");
// // // const jwt = require("jsonwebtoken");

// // // // Models
// // // const Chat = require("../models/chatRoom.model");
// // // const Message = require("../models/message.model");
// // // const Hotel = require("../models/hotel.model");
// // // const Branch = require("../models/branch.model");
// // // const BranchGroup = require("../models/branchGroup.model");
// // // const ValleyBoy = require("../models/valleyboy.model");
// // // const User = require("../models/user.model");
// // // const SuperAdmin = require("../models/superAdmin.model");

// // // // Helper: Normalize role number to string
// // // function normalizeRole(role) {
// // //   switch (role) {
// // //     case 1:
// // //     case "1":
// // //       return "superadmin";
// // //     case 2:
// // //     case "2":
// // //       return "hotel";
// // //     case 3:
// // //     case "3":
// // //       return "branch";
// // //     case 4:
// // //     case "4":
// // //       return "branchgroup";
// // //     case 5:
// // //     case "5":
// // //       return "valleyboy";
// // //     case 6:
// // //     case "6":
// // //       return "user";
// // //     default:
// // //       return null;
// // //   }
// // // }

// // // // Initialize socket
// // // function initSocket(server) {
// // //   const io = new Server(server, {
// // //     cors: { origin: "*" },
// // //     transports: ["websocket", "polling"],
// // //   });

// // //   io.on("connection", (socket) => {
// // //     console.log(`✅ New socket connected: ${socket.id}`);
// // //     let user = null;

// // //     // Authenticate token
// // //     socket.on("credentials", (token) => {
// // //       if (!token) {
// // //         console.log("❌ No token provided");
// // //         return socket.disconnect();
// // //       }

// // //       try {
// // //         const payload = jwt.verify(token, process.env.JWT_SECRET);
// // //         if (!payload || !payload.id || !payload.role) {
// // //           console.log("❌ Token missing id or role");
// // //           return socket.disconnect();
// // //         }

// // //         user = {
// // //           id: payload.id,
// // //           email: payload.email,
// // //           role: normalizeRole(payload.role),
// // //         };

// // //         if (!user.role) {
// // //           console.log("❌ Invalid role mapping");
// // //           return socket.disconnect();
// // //         }

// // //         console.log(`🔐 Authenticated: ${user.id} (${user.role})`);
// // //         socket.emit("authenticated", { message: "Token valid" });
// // //       } catch (err) {
// // //         console.log("❌ Invalid token:", err.message);
// // //         socket.disconnect();
// // //       }
// // //     });

// // //     function safeObjectId(id) {
// // //       return mongoose.isValidObjectId(id)
// // //         ? new mongoose.Types.ObjectId(id)
// // //         : null;
// // //     }

// // //     // Fetch chat list
// // //     // socket.on("fetchChatList", async () => {
// // //     //   try {
// // //     //     if (!user) return;
// // //     //     const userId = safeObjectId(user.id);
// // //     //     const userRole = user.role;

// // //     //     // Existing chats
// // //     //     const chats = await Chat.find({
// // //     //       "participants.userId": userId,
// // //     //       "participants.userModel": userRole,
// // //     //     }).lean();

// // //     //     const contacts = [];
// // //     //     for (const chat of chats) {
// // //     //       const other = chat.participants.find(
// // //     //         (p) => p.userId.toString() !== user.id
// // //     //       );
// // //     //       if (!other) continue;

// // //     //       let name = other.userModel;
// // //     //       switch (other.userModel.toLowerCase()) {
// // //     //         case "hotel":
// // //     //           const h = safeObjectId(other.userId)
// // //     //             ? await Hotel.findById(other.userId).select("name").lean()
// // //     //             : null;
// // //     //           name = h?.name || "Hotel";
// // //     //           break;
// // //     //         case "branch":
// // //     //           const b = safeObjectId(other.userId)
// // //     //             ? await Branch.findById(other.userId).select("name").lean()
// // //     //             : null;
// // //     //           name = b?.name || "Branch";
// // //     //           break;
// // //     //         case "branchgroup":
// // //     //           const bg = safeObjectId(other.userId)
// // //     //             ? await BranchGroup.findById(other.userId)
// // //     //                 .select("userName")
// // //     //                 .lean()
// // //     //             : null;
// // //     //           name = bg?.userName || "Branch Group";
// // //     //           break;
// // //     //         case "valleyboy":
// // //     //           const v = safeObjectId(other.userId)
// // //     //             ? await ValleyBoy.findById(other.userId).select("name").lean()
// // //     //             : null;
// // //     //           name = v?.name || "Valley Boy";
// // //     //           break;
// // //     //         case "user":
// // //     //           const u = safeObjectId(other.userId)
// // //     //             ? await User.findById(other.userId)
// // //     //                 .select("name phoneNumber")
// // //     //                 .lean()
// // //     //             : null;
// // //     //           name = u?.name || u?.phoneNumber || "User";
// // //     //           break;
// // //     //         case "superadmin":
// // //     //           const sa = safeObjectId(other.userId)
// // //     //             ? await SuperAdmin.findById(other.userId)
// // //     //                 .select("username")
// // //     //                 .lean()
// // //     //             : null;
// // //     //           name = sa?.username || "Super Admin";
// // //     //           break;
// // //     //       }

// // //     //       contacts.push({
// // //     //         _id: other.userId.toString(),
// // //     //         role: other.userModel.toLowerCase(),
// // //     //         name,
// // //     //         lastMessage: chat.lastMessage || "",
// // //     //         lastMessageTime: chat.lastMessageTime || null,
// // //     //       });
// // //     //     }

// // //     //     socket.emit("chatList", contacts);
// // //     //   } catch (err) {
// // //     //     console.error("❌ Error fetching chat list:", err);
// // //     //     socket.emit("error", { message: "Failed to fetch chat list" });
// // //     //   }
// // //     // });

// // //     socket.on("fetchChatList", async () => {
// // //       try {
// // //         if (!user) return;
// // //         const userId = safeObjectId(user.id);
// // //         const userRole = user.role;

// // //         // 1️⃣ Fetch existing chats
// // //         const chats = await Chat.find({
// // //           "participants.userId": userId,
// // //           "participants.userModel": userRole,
// // //         }).lean();

// // //         const chatContacts = [];
// // //         for (const chat of chats) {
// // //           const other = chat.participants.find(
// // //             (p) => p.userId.toString() !== user.id
// // //           );
// // //           if (!other) continue;

// // //           let name = other.userModel;
// // //           switch (other.userModel.toLowerCase()) {
// // //             case "hotel":
// // //               const h = await Hotel.findById(other.userId)
// // //                 .select("name")
// // //                 .lean();
// // //               name = h?.name || "Hotel";
// // //               break;
// // //             case "branch":
// // //               const b = await Branch.findById(other.userId)
// // //                 .select("name")
// // //                 .lean();
// // //               name = b?.name || "Branch";
// // //               break;
// // //             case "branchgroup":
// // //               const bg = await BranchGroup.findById(other.userId)
// // //                 .select("userName")
// // //                 .lean();
// // //               name = bg?.userName || "Branch Group";
// // //               break;
// // //             case "valleyboy":
// // //               const v = await ValleyBoy.findById(other.userId)
// // //                 .select("name")
// // //                 .lean();
// // //               name = v?.name || "Valley Boy";
// // //               break;
// // //             case "user":
// // //               const u = await User.findById(other.userId)
// // //                 .select("name phoneNumber")
// // //                 .lean();
// // //               name = u?.name || u?.phoneNumber || "User";
// // //               break;
// // //             case "superadmin":
// // //               const sa = await SuperAdmin.findById(other.userId)
// // //                 .select("username")
// // //                 .lean();
// // //               name = sa?.username || "Super Admin";
// // //               break;
// // //           }

// // //           chatContacts.push({
// // //             _id: other.userId.toString(),
// // //             role: other.userModel.toLowerCase(),
// // //             name,
// // //             lastMessage: chat.lastMessage || "",
// // //             lastMessageTime: chat.lastMessageTime || null,
// // //           });
// // //         }

// // //         // 2️⃣ Add all contacts based on user role
// // //         let staticContacts = [];
// // //         switch (userRole) {
// // //           case "superadmin":
// // //             // Superadmin can see all roles
// // //             const hotels = await Hotel.find().select("_id name").lean();
// // //             const branches = await Branch.find().select("_id name").lean();
// // //             const groups = await BranchGroup.find()
// // //               .select("_id userName")
// // //               .lean();
// // //             const valleys = await ValleyBoy.find().select("_id name").lean();
// // //             const appUsers = await User.find()
// // //               .select("_id name phoneNumber")
// // //               .lean();
// // //             staticContacts = [
// // //               ...hotels.map((h) => ({
// // //                 _id: h._id.toString(),
// // //                 role: "hotel",
// // //                 name: h.name,
// // //               })),
// // //               ...branches.map((b) => ({
// // //                 _id: b._id.toString(),
// // //                 role: "branch",
// // //                 name: b.name,
// // //               })),
// // //               ...groups.map((bg) => ({
// // //                 _id: bg._id.toString(),
// // //                 role: "branchgroup",
// // //                 name: bg.userName,
// // //               })),
// // //               ...valleys.map((v) => ({
// // //                 _id: v._id.toString(),
// // //                 role: "valleyboy",
// // //                 name: v.name,
// // //               })),
// // //               ...appUsers.map((u) => ({
// // //                 _id: u._id.toString(),
// // //                 role: "user",
// // //                 name: u.name || u.phoneNumber,
// // //               })),
// // //             ];
// // //             break;

// // //           case "hotel":
// // //             // Hotel sees branches + superadmin
// // //             const hotelBranches = await Branch.find({ hotelId: userId })
// // //               .select("_id name")
// // //               .lean();
// // //             staticContacts = [
// // //               ...hotelBranches.map((b) => ({
// // //                 _id: b._id.toString(),
// // //                 role: "branch",
// // //                 name: b.name,
// // //               })),
// // //               {
// // //                 _id: "superadmin-placeholder",
// // //                 role: "superadmin",
// // //                 name: "Super Admin",
// // //               },
// // //             ];
// // //             break;

// // //           case "branch":
// // //             // Branch sees hotel + superadmin
// // //             const branchData = await Branch.findById(userId)
// // //               .select("hotelId")
// // //               .lean();
// // //             const hotelInfo = branchData?.hotelId
// // //               ? await Hotel.findById(branchData.hotelId)
// // //                   .select("_id name")
// // //                   .lean()
// // //               : null;
// // //             staticContacts = [
// // //               ...(hotelInfo
// // //                 ? [
// // //                     {
// // //                       _id: hotelInfo._id.toString(),
// // //                       role: "hotel",
// // //                       name: hotelInfo.name,
// // //                     },
// // //                   ]
// // //                 : []),
// // //               {
// // //                 _id: "superadmin-placeholder",
// // //                 role: "superadmin",
// // //                 name: "Super Admin",
// // //               },
// // //             ];
// // //             break;

// // //           case "branchgroup":
// // //             // Branchgroup sees assigned branches
// // //             const assignedBranches = await Branch.find({
// // //               _id: { $in: user.AssignedBranch || [] },
// // //             })
// // //               .select("_id name")
// // //               .lean();
// // //             staticContacts = assignedBranches.map((b) => ({
// // //               _id: b._id.toString(),
// // //               role: "branch",
// // //               name: b.name,
// // //             }));
// // //             break;

// // //           case "valleyboy":
// // //             // Valleyboy sees hotel + branch
// // //             const vbBranch = user.branchId
// // //               ? await Branch.findById(user.branchId).select("_id name").lean()
// // //               : null;
// // //             const vbHotel =
// // //               !vbBranch && user.hotelId
// // //                 ? await Hotel.findById(user.hotelId).select("_id name").lean()
// // //                 : null;
// // //             staticContacts = [
// // //               ...(vbBranch
// // //                 ? [
// // //                     {
// // //                       _id: vbBranch._id.toString(),
// // //                       role: "branch",
// // //                       name: vbBranch.name,
// // //                     },
// // //                   ]
// // //                 : []),
// // //               ...(vbHotel
// // //                 ? [
// // //                     {
// // //                       _id: vbHotel._id.toString(),
// // //                       role: "hotel",
// // //                       name: vbHotel.name,
// // //                     },
// // //                   ]
// // //                 : []),
// // //             ];
// // //             break;

// // //           case "user":
// // //             // Regular user sees valleyboys from chats
// // //             const userChats = await Chat.find({
// // //               "participants.userId": userId,
// // //               "participants.userModel": "user",
// // //             }).lean();
// // //             const valleyIds = userChats
// // //               .map((c) =>
// // //                 c.participants.find((p) => p.userModel === "valleyboy")
// // //               )
// // //               .filter(Boolean);
// // //             const valleyInfos = await ValleyBoy.find({
// // //               _id: { $in: valleyIds.map((v) => v.userId) },
// // //             })
// // //               .select("_id name")
// // //               .lean();
// // //             staticContacts = valleyInfos.map((v) => ({
// // //               _id: v._id.toString(),
// // //               role: "valleyboy",
// // //               name: v.name,
// // //             }));
// // //             break;
// // //         }

// // //         // 3️⃣ Merge & remove duplicates
// // //         const merged = [...chatContacts, ...staticContacts];
// // //         const unique = [];
// // //         const seen = new Set();
// // //         for (const c of merged) {
// // //           const key = `${c._id}-${c.role}`;
// // //           if (!seen.has(key)) {
// // //             seen.add(key);
// // //             unique.push(c);
// // //           }
// // //         }

// // //         socket.emit("chatList", unique);
// // //       } catch (err) {
// // //         console.error("❌ Error fetching chat list:", err);
// // //         socket.emit("error", { message: "Failed to fetch chat list" });
// // //       }
// // //     });

// // //     // Join chat room
// // //     // socket.on("joinChat", async (chatUserId, chatUserRole) => {
// // //     //   try {
// // //     //     if (!user) return;
// // //     //     const senderId = safeObjectId(user.id);
// // //     //     const receiverId = safeObjectId(chatUserId);
// // //     //     if (!senderId || !receiverId) return;

// // //     //     const senderRole = user.role;
// // //     //     const receiverRole = normalizeRole(chatUserRole);

// // //     //     let chat = await Chat.findOne({
// // //     //       participants: {
// // //     //         $all: [
// // //     //           { $elemMatch: { userId: senderId, userModel: senderRole } },
// // //     //           { $elemMatch: { userId: receiverId, userModel: receiverRole } },
// // //     //         ],
// // //     //       },
// // //     //     });

// // //     //     if (!chat) {
// // //     //       chat = await Chat.create({
// // //     //         participants: [
// // //     //           { userId: senderId, userModel: senderRole },
// // //     //           { userId: receiverId, userModel: receiverRole },
// // //     //         ],
// // //     //       });
// // //     //     }

// // //     //     const roomId = chat._id.toString();
// // //     //     socket.join(roomId);

// // //     //     const messages = await Message.find({ chatId: roomId })
// // //     //       .sort({ createdAt: 1 })
// // //     //       .lean();
// // //     //     socket.emit("chatHistory", messages);
// // //     //   } catch (err) {
// // //     //     console.error("❌ Error joining chat:", err);
// // //     //   }
// // //     // });

// // //     // // Send message
// // //     // socket.on("sendMessage", async ({ chatUserId, chatUserRole, text }) => {
// // //     //   try {
// // //     //     if (!user || !chatUserId || !text) return;

// // //     //     const senderId = safeObjectId(user.id);
// // //     //     const receiverId = safeObjectId(chatUserId);
// // //     //     if (!senderId || !receiverId) return;

// // //     //     const senderRole = user.role;
// // //     //     const receiverRole = normalizeRole(chatUserRole);

// // //     //     let chat = await Chat.findOne({
// // //     //       participants: {
// // //     //         $all: [
// // //     //           { $elemMatch: { userId: senderId, userModel: senderRole } },
// // //     //           { $elemMatch: { userId: receiverId, userModel: receiverRole } },
// // //     //         ],
// // //     //       },
// // //     //     });

// // //     //     if (!chat) {
// // //     //       chat = await Chat.create({
// // //     //         participants: [
// // //     //           { userId: senderId, userModel: senderRole },
// // //     //           { userId: receiverId, userModel: receiverRole },
// // //     //         ],
// // //     //       });
// // //     //     }

// // //     //     const roomId = chat._id.toString();

// // //     //     const message = await Message.create({
// // //     //       chatId: roomId,
// // //     //       text,
// // //     //       sender: { userId: senderId, userModel: senderRole },
// // //     //       deliveredTo: [],
// // //     //       readBy: [],
// // //     //     });

// // //     //     await Chat.findByIdAndUpdate(roomId, {
// // //     //       lastMessage: text,
// // //     //       lastMessageTime: new Date(),
// // //     //     });

// // //     //     io.to(roomId).emit("newMessage", message);
// // //     //   } catch (err) {
// // //     //     console.error("❌ Error sending message:", err);
// // //     //     socket.emit("error", { message: "Failed to send message" });
// // //     //   }
// // //     // });

// // //     socket.on("joinChat", async (chatUserId, chatUserRole) => {
// // //       try {
// // //         if (!user) return;

// // //         const senderId = safeObjectId(user.id);
// // //         if (!senderId) return;

// // //         const receiverId = safeObjectId(chatUserId);
// // //         if (!receiverId) {
// // //           console.log("❌ Invalid receiver ID:", chatUserId);
// // //           return socket.emit("error", { message: "Invalid receiver ID" });
// // //         }

// // //         const senderRole = user.role;
// // //         const receiverRole = normalizeRole(chatUserRole);

// // //         if (!receiverRole) {
// // //           console.log("❌ Invalid receiver role:", chatUserRole);
// // //           return socket.emit("error", { message: "Invalid receiver role" });
// // //         }

// // //         // Find or create chat
// // //         let chat = await Chat.findOne({
// // //           participants: {
// // //             $all: [
// // //               { $elemMatch: { userId: senderId, userModel: senderRole } },
// // //               { $elemMatch: { userId: receiverId, userModel: receiverRole } },
// // //             ],
// // //           },
// // //         });

// // //         if (!chat) {
// // //           chat = await Chat.create({
// // //             participants: [
// // //               { userId: senderId, userModel: senderRole },
// // //               { userId: receiverId, userModel: receiverRole },
// // //             ],
// // //           });
// // //           console.log("✅ Created new chat:", chat._id.toString());
// // //         }

// // //         const roomId = chat._id.toString();
// // //         socket.join(roomId);

// // //         const messages = await Message.find({ chatId: roomId })
// // //           .sort({ createdAt: 1 })
// // //           .lean();

// // //         socket.emit("chatHistory", messages);
// // //         console.log(`📥 Joined chat room ${roomId} with role ${receiverRole}`);
// // //       } catch (err) {
// // //         console.error("❌ Error joining chat:", err.message);
// // //         socket.emit("error", { message: "Failed to join chat" });
// // //       }
// // //     });

// // //     // Send message
// // //     socket.on("sendMessage", async ({ chatUserId, chatUserRole, text }) => {
// // //       try {
// // //         if (!user) return;
// // //         if (!chatUserId || !text) return;

// // //         const senderId = safeObjectId(user.id);
// // //         const receiverId = safeObjectId(chatUserId);
// // //         if (!senderId || !receiverId) {
// // //           console.log("❌ Invalid sender or receiver ID");
// // //           return socket.emit("error", { message: "Invalid IDs" });
// // //         }

// // //         const senderRole = user.role;
// // //         const receiverRole = normalizeRole(chatUserRole);

// // //         if (!receiverRole) {
// // //           console.log("❌ Invalid receiver role:", chatUserRole);
// // //           return socket.emit("error", { message: "Invalid receiver role" });
// // //         }

// // //         let chat = await Chat.findOne({
// // //           participants: {
// // //             $all: [
// // //               { $elemMatch: { userId: senderId, userModel: senderRole } },
// // //               { $elemMatch: { userId: receiverId, userModel: receiverRole } },
// // //             ],
// // //           },
// // //         });

// // //         if (!chat) {
// // //           chat = await Chat.create({
// // //             participants: [
// // //               { userId: senderId, userModel: senderRole },
// // //               { userId: receiverId, userModel: receiverRole },
// // //             ],
// // //           });
// // //           console.log("✅ Created new chat:", chat._id.toString());
// // //         }

// // //         const roomId = chat._id.toString();

// // //         const message = await Message.create({
// // //           chatId: roomId,
// // //           text,
// // //           sender: { userId: senderId, userModel: senderRole },
// // //           deliveredTo: [],
// // //           readBy: [],
// // //         });

// // //         await Chat.findByIdAndUpdate(roomId, {
// // //           lastMessage: text,
// // //           lastMessageTime: new Date(),
// // //         });

// // //         io.to(roomId).emit("newMessage", message);
// // //         console.log(`💬 Message sent to room ${roomId}`);
// // //       } catch (err) {
// // //         console.error("❌ Error sending message:", err.message);
// // //         socket.emit("error", { message: "Failed to send message" });
// // //       }
// // //     });

// // //     socket.on("disconnect", () => {
// // //       console.log(`❌ Disconnected: ${socket.id}`);
// // //     });
// // //   });
// // // }

// // // module.exports = initSocket;

// // const { Server } = require("socket.io");
// // const mongoose = require("mongoose");
// // const jwt = require("jsonwebtoken");

// // // Models
// // const Chat = require("../models/chatRoom.model");
// // const Message = require("../models/message.model");
// // const Hotel = require("../models/hotel.model");
// // const Branch = require("../models/branch.model");
// // const BranchGroup = require("../models/branchGroup.model");
// // const ValleyBoy = require("../models/valleyboy.model");
// // const User = require("../models/user.model");
// // const SuperAdmin = require("../models/superAdmin.model");

// // // Helper: Normalize role number or string to standard string
// // function normalizeRole(role) {
// //   if (!role) return null;

// //   // Convert numeric string to number
// //   if (!isNaN(role)) role = Number(role);

// //   // Map numbers
// //   switch (role) {
// //     case 1:
// //       return "superadmin";
// //     case 2:
// //       return "hotel";
// //     case 3:
// //       return "branch";
// //     case 4:
// //       return "branchgroup";
// //     case 5:
// //       return "valleyboy";
// //     case 6:
// //       return "user";
// //   }

// //   // Map string roles
// //   const roleStr = String(role).toLowerCase();
// //   switch (roleStr) {
// //     case "superadmin":
// //       return "superadmin";
// //     case "hotel":
// //       return "hotel";
// //     case "branch":
// //       return "branch";
// //     case "branchgroup":
// //       return "branchgroup";
// //     case "valleyboy":
// //       return "valleyboy";
// //     case "user":
// //       return "user";
// //   }

// //   return null; // invalid role
// // }

// // // Safe ObjectId
// // function safeObjectId(id) {
// //   return mongoose.isValidObjectId(id) ? new mongoose.Types.ObjectId(id) : null;
// // }

// // // Initialize socket
// // function initSocket(server) {
// //   const io = new Server(server, {
// //     cors: { origin: "*" },
// //     transports: ["websocket", "polling"],
// //   });

// //   io.on("connection", (socket) => {
// //     console.log(`✅ New socket connected: ${socket.id}`);
// //     let user = null;

// //     // Authenticate token
// //     socket.on("credentials", (token) => {
// //       if (!token) {
// //         console.log("❌ No token provided");
// //         return socket.disconnect();
// //       }

// //       try {
// //         const payload = jwt.verify(token, process.env.JWT_SECRET);
// //         if (!payload || !payload.id || !payload.role) {
// //           console.log("❌ Token missing id or role");
// //           return socket.disconnect();
// //         }

// //         user = {
// //           id: payload.id,
// //           email: payload.email,
// //           role: normalizeRole(payload.role),
// //         };

// //         if (!user.role) {
// //           console.log("❌ Invalid role mapping");
// //           return socket.disconnect();
// //         }

// //         console.log(`🔐 Authenticated: ${user.id} (${user.role})`);
// //         socket.emit("authenticated", { message: "Token valid" });
// //       } catch (err) {
// //         console.log("❌ Invalid token:", err.message);
// //         socket.disconnect();
// //       }
// //     });

// //     // Fetch chat list
// //     // socket.on("fetchChatList", async () => {
// //     //   try {
// //     //     if (!user) return;
// //     //     const userId = safeObjectId(user.id);
// //     //     const userRole = user.role;

// //     //     // 1️⃣ Existing chats
// //     //     const chats = await Chat.find({
// //     //       "participants.userId": userId,
// //     //       "participants.userModel": userRole,
// //     //     }).lean();

// //     //     const chatContacts = [];
// //     //     for (const chat of chats) {
// //     //       const other = chat.participants.find(
// //     //         (p) => p.userId.toString() !== user.id
// //     //       );
// //     //       if (!other) continue;

// //     //       let name = other.userModel;
// //     //       switch (other.userModel.toLowerCase()) {
// //     //         case "hotel":
// //     //           const h = await Hotel.findById(other.userId)
// //     //             .select("name")
// //     //             .lean();
// //     //           name = h?.name || "Hotel";
// //     //           break;
// //     //         case "branch":
// //     //           const b = await Branch.findById(other.userId)
// //     //             .select("name")
// //     //             .lean();
// //     //           name = b?.name || "Branch";
// //     //           break;
// //     //         case "branchgroup":
// //     //           const bg = await BranchGroup.findById(other.userId)
// //     //             .select("userName")
// //     //             .lean();
// //     //           name = bg?.userName || "Branch Group";
// //     //           break;
// //     //         case "valleyboy":
// //     //           const v = await ValleyBoy.findById(other.userId)
// //     //             .select("name")
// //     //             .lean();
// //     //           name = v?.name || "Valley Boy";
// //     //           break;
// //     //         case "user":
// //     //           const u = await User.findById(other.userId)
// //     //             .select("name phoneNumber")
// //     //             .lean();
// //     //           name = u?.name || u?.phoneNumber || "User";
// //     //           break;
// //     //         case "superadmin":
// //     //           const sa = await SuperAdmin.findById(other.userId)
// //     //             .select("username")
// //     //             .lean();
// //     //           name = sa?.username || "Super Admin";
// //     //           break;
// //     //       }

// //     //       chatContacts.push({
// //     //         _id: other.userId.toString(),
// //     //         role: other.userModel.toLowerCase(),
// //     //         name,
// //     //         lastMessage: chat.lastMessage || "",
// //     //         lastMessageTime: chat.lastMessageTime || null,
// //     //       });
// //     //     }

// //     //     // 2️⃣ Merge with static contacts based on role (optional)
// //     //     // You can implement static contacts per role here if needed

// //     //     socket.emit("chatList", chatContacts);
// //     //   } catch (err) {
// //     //     console.error("❌ Error fetching chat list:", err);
// //     //     socket.emit("error", { message: "Failed to fetch chat list" });
// //     //   }
// //     // });

// //     socket.on("fetchChatList", async () => {
// //       try {
// //         if (!user) return;
// //         const userId = safeObjectId(user.id);
// //         const userRole = user.role;

// //         // 1️⃣ Existing chats
// //         const chats = await Chat.find({
// //           "participants.userId": userId,
// //           "participants.userModel": userRole,
// //         }).lean();

// //         const chatContacts = [];
// //         for (const chat of chats) {
// //           const other = chat.participants.find(
// //             (p) => p.userId.toString() !== user.id
// //           );
// //           if (!other) continue;

// //           let name = other.userModel;
// //           switch (other.userModel.toLowerCase()) {
// //             case "hotel":
// //               const h = await Hotel.findById(other.userId)
// //                 .select("name")
// //                 .lean();
// //               name = h?.name || "Hotel";
// //               break;
// //             case "branch":
// //               const b = await Branch.findById(other.userId)
// //                 .select("name")
// //                 .lean();
// //               name = b?.name || "Branch";
// //               break;
// //             case "branchgroup":
// //               const bg = await BranchGroup.findById(other.userId)
// //                 .select("userName")
// //                 .lean();
// //               name = bg?.userName || "Branch Group";
// //               break;
// //             case "valleyboy":
// //               const v = await ValleyBoy.findById(other.userId)
// //                 .select("name")
// //                 .lean();
// //               name = v?.name || "Valley Boy";
// //               break;
// //             case "user":
// //               const u = await User.findById(other.userId)
// //                 .select("name phoneNumber")
// //                 .lean();
// //               name = u?.name || u?.phoneNumber || "User";
// //               break;
// //             case "superadmin":
// //               const sa = await SuperAdmin.findById(other.userId)
// //                 .select("username")
// //                 .lean();
// //               name = sa?.username || "Super Admin";
// //               break;
// //           }

// //           chatContacts.push({
// //             _id: other.userId.toString(),
// //             role: other.userModel.toLowerCase(),
// //             name,
// //             lastMessage: chat.lastMessage || "",
// //             lastMessageTime: chat.lastMessageTime || null,
// //           });
// //         }

// //         // 2️⃣ Add static contacts per role
// //         let staticContacts = [];
// //         switch (userRole) {
// //           case "superadmin":
// //             // See all roles
// //             const hotels = await Hotel.find().select("_id name").lean();
// //             const branches = await Branch.find().select("_id name").lean();
// //             const groups = await BranchGroup.find()
// //               .select("_id userName")
// //               .lean();
// //             const valleys = await ValleyBoy.find().select("_id name").lean();
// //             const appUsers = await User.find()
// //               .select("_id name phoneNumber")
// //               .lean();
// //             staticContacts = [
// //               ...hotels.map((h) => ({
// //                 _id: h._id.toString(),
// //                 role: "hotel",
// //                 name: h.name,
// //               })),
// //               ...branches.map((b) => ({
// //                 _id: b._id.toString(),
// //                 role: "branch",
// //                 name: b.name,
// //               })),
// //               ...groups.map((bg) => ({
// //                 _id: bg._id.toString(),
// //                 role: "branchgroup",
// //                 name: bg.userName,
// //               })),
// //               ...valleys.map((v) => ({
// //                 _id: v._id.toString(),
// //                 role: "valleyboy",
// //                 name: v.name,
// //               })),
// //               ...appUsers.map((u) => ({
// //                 _id: u._id.toString(),
// //                 role: "user",
// //                 name: u.name || u.phoneNumber,
// //               })),
// //             ];
// //             break;

// //           case "hotel":
// //             // See branches of this hotel + superadmin
// //             const hotelBranches = await Branch.find({ hotelId: userId })
// //               .select("_id name")
// //               .lean();
// //             staticContacts = [
// //               ...hotelBranches.map((b) => ({
// //                 _id: b._id.toString(),
// //                 role: "branch",
// //                 name: b.name,
// //               })),
// //               {
// //                 _id: "superadmin-placeholder",
// //                 role: "superadmin",
// //                 name: "Super Admin",
// //               },
// //             ];
// //             break;

// //           case "branch":
// //             // See its hotel + superadmin
// //             const branchData = await Branch.findById(userId)
// //               .select("hotelId")
// //               .lean();
// //             const hotelInfo = branchData?.hotelId
// //               ? await Hotel.findById(branchData.hotelId)
// //                   .select("_id name")
// //                   .lean()
// //               : null;
// //             staticContacts = [
// //               ...(hotelInfo
// //                 ? [
// //                     {
// //                       _id: hotelInfo._id.toString(),
// //                       role: "hotel",
// //                       name: hotelInfo.name,
// //                     },
// //                   ]
// //                 : []),
// //               {
// //                 _id: "superadmin-placeholder",
// //                 role: "superadmin",
// //                 name: "Super Admin",
// //               },
// //             ];
// //             break;

// //           case "branchgroup":
// //             const assignedBranches = await Branch.find({
// //               _id: { $in: user.AssignedBranch || [] },
// //             })
// //               .select("_id name")
// //               .lean();
// //             staticContacts = assignedBranches.map((b) => ({
// //               _id: b._id.toString(),
// //               role: "branch",
// //               name: b.name,
// //             }));
// //             break;

// //           case "valleyboy":
// //             const vbBranch = user.branchId
// //               ? await Branch.findById(user.branchId).select("_id name").lean()
// //               : null;
// //             const vbHotel =
// //               !vbBranch && user.hotelId
// //                 ? await Hotel.findById(user.hotelId).select("_id name").lean()
// //                 : null;
// //             staticContacts = [
// //               ...(vbBranch
// //                 ? [
// //                     {
// //                       _id: vbBranch._id.toString(),
// //                       role: "branch",
// //                       name: vbBranch.name,
// //                     },
// //                   ]
// //                 : []),
// //               ...(vbHotel
// //                 ? [
// //                     {
// //                       _id: vbHotel._id.toString(),
// //                       role: "hotel",
// //                       name: vbHotel.name,
// //                     },
// //                   ]
// //                 : []),
// //             ];
// //             break;

// //           case "user":
// //             const userChats = await Chat.find({
// //               "participants.userId": userId,
// //               "participants.userModel": "user",
// //             }).lean();
// //             const valleyIds = userChats
// //               .map((c) =>
// //                 c.participants.find((p) => p.userModel === "valleyboy")
// //               )
// //               .filter(Boolean);
// //             const valleyInfos = await ValleyBoy.find({
// //               _id: { $in: valleyIds.map((v) => v.userId) },
// //             })
// //               .select("_id name")
// //               .lean();
// //             staticContacts = valleyInfos.map((v) => ({
// //               _id: v._id.toString(),
// //               role: "valleyboy",
// //               name: v.name,
// //             }));
// //             break;
// //         }

// //         // 3️⃣ Merge & remove duplicates
// //         const merged = [...chatContacts, ...staticContacts];
// //         const unique = [];
// //         const seen = new Set();
// //         for (const c of merged) {
// //           const key = `${c._id}-${c.role}`;
// //           if (!seen.has(key)) {
// //             seen.add(key);
// //             unique.push(c);
// //           }
// //         }

// //         socket.emit("chatList", unique);
// //       } catch (err) {
// //         console.error("❌ Error fetching chat list:", err);
// //         socket.emit("error", { message: "Failed to fetch chat list" });
// //       }
// //     });

// //     // Join chat
// //     socket.on("joinChat", async (chatUserId, chatUserRole) => {
// //       try {
// //         if (!user) return;
// //         const senderId = safeObjectId(user.id);
// //         const receiverId = safeObjectId(chatUserId);
// //         const receiverRole = normalizeRole(chatUserRole);

// //         if (!senderId || !receiverId || !receiverRole) {
// //           console.log("❌ Invalid IDs or role:", chatUserId, chatUserRole);
// //           return socket.emit("error", { message: "Invalid receiver or role" });
// //         }

// //         const senderRole = user.role;

// //         let chat = await Chat.findOne({
// //           participants: {
// //             $all: [
// //               { $elemMatch: { userId: senderId, userModel: senderRole } },
// //               { $elemMatch: { userId: receiverId, userModel: receiverRole } },
// //             ],
// //           },
// //         });

// //         if (!chat) {
// //           chat = await Chat.create({
// //             participants: [
// //               { userId: senderId, userModel: senderRole },
// //               { userId: receiverId, userModel: receiverRole },
// //             ],
// //           });
// //           console.log("✅ Created new chat:", chat._id.toString());
// //         }

// //         const roomId = chat._id.toString();
// //         socket.join(roomId);

// //         const messages = await Message.find({ chatId: roomId })
// //           .sort({ createdAt: 1 })
// //           .lean();
// //         socket.emit("chatHistory", messages);
// //         console.log(`📥 Joined chat room ${roomId}`);
// //       } catch (err) {
// //         console.error("❌ Error joining chat:", err.message);
// //         socket.emit("error", { message: "Failed to join chat" });
// //       }
// //     });

// //     // Send message
// //     socket.on("sendMessage", async ({ chatUserId, chatUserRole, text }) => {
// //       try {
// //         if (!user || !chatUserId || !text) return;

// //         const senderId = safeObjectId(user.id);
// //         const receiverId = safeObjectId(chatUserId);
// //         const senderRole = user.role;
// //         const receiverRole = normalizeRole(chatUserRole);

// //         if (!senderId || !receiverId || !receiverRole) {
// //           console.log("❌ Invalid IDs or role for sending message");
// //           return socket.emit("error", { message: "Invalid IDs or role" });
// //         }

// //         let chat = await Chat.findOne({
// //           participants: {
// //             $all: [
// //               { $elemMatch: { userId: senderId, userModel: senderRole } },
// //               { $elemMatch: { userId: receiverId, userModel: receiverRole } },
// //             ],
// //           },
// //         });

// //         if (!chat) {
// //           chat = await Chat.create({
// //             participants: [
// //               { userId: senderId, userModel: senderRole },
// //               { userId: receiverId, userModel: receiverRole },
// //             ],
// //           });
// //           console.log("✅ Created new chat:", chat._id.toString());
// //         }

// //         const roomId = chat._id.toString();
// //         const message = await Message.create({
// //           chatId: roomId,
// //           text,
// //           sender: { userId: senderId, userModel: senderRole },
// //           deliveredTo: [],
// //           readBy: [],
// //         });

// //         await Chat.findByIdAndUpdate(roomId, {
// //           lastMessage: text,
// //           lastMessageTime: new Date(),
// //         });

// //         io.to(roomId).emit("newMessage", message);
// //         console.log(`💬 Message sent to room ${roomId}`);
// //       } catch (err) {
// //         console.error("❌ Error sending message:", err.message);
// //         socket.emit("error", { message: "Failed to send message" });
// //       }
// //     });

// //     socket.on("disconnect", () => {
// //       console.log(`❌ Disconnected: ${socket.id}`);
// //     });
// //   });
// // }

// // module.exports = initSocket;

// const { Server } = require("socket.io");
// const mongoose = require("mongoose");
// const jwt = require("jsonwebtoken");

// // Models
// const Chat = require("../models/chatRoom.model");
// const Message = require("../models/message.model");
// const Hotel = require("../models/hotel.model");
// const Branch = require("../models/branch.model");
// const BranchGroup = require("../models/branchGroup.model");
// const ValleyBoy = require("../models/valleyboy.model");
// const User = require("../models/user.model");
// const SuperAdmin = require("../models/superAdmin.model");
// const Parking = require("../models/parking.model");

// // Helper: Normalize role
// function normalizeRole(role) {
//   if (!role) return null;
//   if (!isNaN(role)) role = Number(role);
//   switch (role) {
//     case 1: return "superadmin";
//     case 2: return "hotel";
//     case 3: return "branch";
//     case 4: return "branchgroup";
//     case 5: return "valleyboy";
//     case 6: return "user";
//   }
//   const roleStr = String(role).toLowerCase();
//   switch (roleStr) {
//     case "superadmin": return "superadmin";
//     case "hotel": return "hotel";
//     case "branch": return "branch";
//     case "branchgroup": return "branchgroup";
//     case "valleyboy": return "valleyboy";
//     case "user": return "user";
//   }
//   return null;
// }

// // Safe ObjectId
// function safeObjectId(id) {
//   return mongoose.isValidObjectId(id) ? new mongoose.Types.ObjectId(id) : null;
// }

// // Initialize socket
// function initSocket(server) {
//   const io = new Server(server, {
//     cors: { origin: "*" },
//     transports: ["websocket", "polling"],
//   });

//   // Track Valley Boy sockets
//   const valleyBoySockets = new Map(); // userId -> socketId
//   io.valleyBoySockets = valleyBoySockets;

//   io.on("connection", (socket) => {
//     console.log(`✅ New socket connected: ${socket.id}`);
//     let user = null;

//     // Authenticate token
//     socket.on("credentials", (token) => {
//       if (!token) return socket.disconnect();
//       try {
//         const payload = jwt.verify(token, process.env.JWT_SECRET);
//         if (!payload?.id || !payload?.role) return socket.disconnect();

//         user = {
//           id: payload.id,
//           email: payload.email,
//           role: normalizeRole(payload.role),
//         };

//         if (!user.role) return socket.disconnect();

//         // Track Valley Boy sockets
//         if (user.role === "valleyboy") {
//           valleyBoySockets.set(user.id, socket.id);
//           console.log(`📌 Valley Boy connected: ${user.id}`);
//         }

//         socket.emit("authenticated", { message: "Token valid" });
//       } catch (err) {
//         console.log("❌ Invalid token:", err.message);
//         socket.disconnect();
//       }
//     });

//     // ----------------- Existing socket code -----------------
//     // fetchChatList, joinChat, sendMessage ...
//     // Keep your entire previous socket code exactly as-is
//     // --------------------------------------------------------

//     // Receive WhatsApp message and emit to Valley Boy
//     socket.on("sendWhatsAppReply", async ({ from, message, parkingId }) => {
//       try {
//         if (!parkingId || !message) return;
//         const parking = await Parking.findById(parkingId);
//         if (!parking) return;

//         const valleyBoyId = parking.valleyBoyId;
//         if (!valleyBoyId) return;

//         const valleyBoySocketId = valleyBoySockets.get(valleyBoyId.toString());
//         if (!valleyBoySocketId) return;

//         io.to(valleyBoySocketId).emit("incomingWhatsAppMessage", {
//           from,
//           message,
//           parkingId,
//           valleyBoyName: parking.valleyBoyName || "Valley Boy",
//         });

//         console.log(
//           `📩 WhatsApp message for Valley Boy ${valleyBoyId}: ${message}`
//         );
//       } catch (err) {
//         console.error("❌ Error sending WhatsApp message to Valley Boy:", err);
//       }
//     });

//     socket.on("disconnect", () => {
//       if (user?.role === "valleyboy") valleyBoySockets.delete(user.id);
//       console.log(`❌ Disconnected: ${socket.id}`);
//     });
//   });

//   return io;
// }

// module.exports = initSocket;

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
