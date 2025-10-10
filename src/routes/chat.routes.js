// // // const express = require("express");
// // // const router = express.Router();
// // // const chatController = require("../controllers/chat.controller");
// // // const authenticate = require("../middleware/authMiddleware");

// // // router.post("/room", authenticate, chatController.getOrCreateRoom);
// // // router.post("/send", authenticate, chatController.sendMessage);
// // // router.get("/messages/:roomId", authenticate, chatController.getMessages);

// // // module.exports = router;

// // const express = require("express");
// // const router = express.Router();
// // const auth = require("../middleware/authMiddleware");
// // const chatController = require("../controllers/chat.controller");

// // router.post("/room", auth, chatController.getOrCreateRoom);
// // router.post("/send", auth, chatController.sendMessage);
// // router.get("/messages/:roomId", auth, chatController.getMessages);
// // router.get("/list", auth, chatController.getChatList);

// // module.exports = router;

// // routes/chat.routes.js
// // import express from "express";

// import auth from "../middleware/authMiddleware.js";
// import {
//   getContactsByRole,
//   accessChat,
// } from "../controllers/chat.controller.js";

// const router = express.Router();

// /**
//  * 📇 Get contact list depending on logged-in user's role
//  * GET /api/chat/contacts
//  */
// router.get("/contacts", auth, getContactsByRole);

// /**
//  * 🧾 Get or create chat room between user and target
//  * POST /api/chat/room
//  * Body: { targetId, targetRole }
//  */
// router.post("/room", auth, accessChat);

// export default router;

// routes/chat.routes.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const chatController = require("../controllers/chat.controller");

// 📇 Get contact list depending on logged-in user's role
// GET /api/chat/contacts
router.get("/contacts", auth, chatController.getContactsByRole);

// 🧾 Get or create chat room between user and target
// POST /api/chat/room
// Body: { targetId, targetRole }
router.post("/room", auth, chatController.accessChat);

// Optional: Send message
// POST /api/chat/send
// Body: { chatId, text }
// router.post("/send", auth, chatController.sendMessage);

// // Optional: Get chat messages
// // GET /api/chat/messages/:chatId
// router.get("/messages/:chatId", auth, chatController.getMessages);

module.exports = router;
