// // // // // // const {
// // // // // //   waMessageIdToParkingIdMap,
// // // // // // } = require("../controllers/parking.controller");
// // // // // // const Parking = require("../models/parking.model");
// // // // // // // const { waMessageIdToParkingIdMap } = require("./sendWhatsAppTemplateMessage"); // map from template msgId -> parkingId

// // // // // // module.exports = function setupWhatsAppWebhook(io) {
// // // // // //   return async (req, res) => {
// // // // // //     try {
// // // // // //       console.log(
// // // // // //         "📩 Incoming WhatsApp payload:",
// // // // // //         JSON.stringify(req.body, null, 2)
// // // // // //       );

// // // // // //       const messages = req.body?.entry?.[0]?.changes?.[0]?.value?.messages ||
// // // // // //         req.body?.messages || [req.body];

// // // // // //       console.log(messages, "Log frm my side");

// // // // // //       for (const body of messages) {
// // // // // //         const from = body?.from || body?.phone || body?.sender || body?.mobile;
// // // // // //         const messageText =
// // // // // //           body?.text?.body || body?.body || body?.msg || req.body?.text;

// // // // // //         if (!from || !messageText) {
// // // // // //           console.log("⚠️ No 'from' or 'messageText' found, skipping.");
// // // // // //           continue;
// // // // // //         }

// // // // // //         let parkingId = null;

// // // // // //         // 1️⃣ Check if the user clicked a button
// // // // // //         if (body?.button?.payload) {
// // // // // //           parkingId = body.button.payload;
// // // // // //         }

// // // // // //         // 2️⃣ Check if the message is a reply to a template
// // // // // //         if (!parkingId && body?.context?.id) {
// // // // // //           parkingId = waMessageIdToParkingIdMap.get(body.context.id);
// // // // // //         }

// // // // // //         // 3️⃣ Check if message contains a 24-character parking ID
// // // // // //         if (!parkingId) {
// // // // // //           const normalizedText = messageText.replace(/\s+/g, " ").trim();
// // // // // //           const match = normalizedText.match(/[a-f0-9]{24}/i);
// // // // // //           parkingId = match ? match[0] : null;
// // // // // //         }

// // // // // //         if (!parkingId) {
// // // // // //           console.log("⚠️ No parking ID found in message text:", messageText);
// // // // // //           continue;
// // // // // //         }

// // // // // //         // Find the parking document
// // // // // //         const parking = await Parking.findById(parkingId);
// // // // // //         if (!parking) {
// // // // // //           console.log("❌ Parking not found for ID:", parkingId);
// // // // // //           continue;
// // // // // //         }

// // // // // //         // Find the Valley Boy socket
// // // // // //         const valleyBoyId = parking.valleyBoyId?.toString();
// // // // // //         const valleyBoySockets = io.valleyBoySockets || new Map();
// // // // // //         const valleyBoySocketId = valleyBoySockets.get(valleyBoyId);

// // // // // //         if (!valleyBoySocketId) {
// // // // // //           console.log("⚠️ Valley Boy not connected for parking:", parkingId);
// // // // // //           continue;
// // // // // //         }

// // // // // //         // Forward the message to the Valley Boy
// // // // // //         io.to(valleyBoySocketId).emit("incomingWhatsAppMessage", {
// // // // // //           from,
// // // // // //           message: messageText,
// // // // // //           parkingId,
// // // // // //           valleyBoyName: parking.valleyBoyName || "Valley Boy",
// // // // // //         });

// // // // // //         console.log(
// // // // // //           "✅ WhatsApp message delivered to Valley Boy socket:",
// // // // // //           valleyBoySocketId
// // // // // //         );
// // // // // //         console.log("Parking ID extracted:", parkingId);
// // // // // //         console.log("Message text:", messageText);
// // // // // //       }

// // // // // //       res.status(200).json({ status: "ok" });
// // // // // //     } catch (error) {
// // // // // //       console.error("❌ Error in WhatsApp webhook:", error);
// // // // // //       res.status(500).json({ status: "error", message: error.message });
// // // // // //     }
// // // // // //   };
// // // // // // };

// // // // // const {
// // // // //   waMessageIdToParkingIdMap,
// // // // // } = require("../controllers/parking.controller");
// // // // // const Parking = require("../models/parking.model");

// // // // // module.exports = function setupWhatsAppWebhook(io) {
// // // // //   return async (req, res) => {
// // // // //     try {
// // // // //       console.log(
// // // // //         "📩 Incoming WhatsApp payload:",
// // // // //         JSON.stringify(req.body, null, 2)
// // // // //       );

// // // // //       // Normalize messages array
// // // // //       const messages =
// // // // //         req.body?.entry?.[0]?.changes?.[0]?.value?.messages ||
// // // // //         req.body?.messages ||
// // // // //         (req.body?.message ? [req.body.message] : []);

// // // // //       if (!messages || messages.length === 0) {
// // // // //         console.log("⚠️ No messages found in payload");
// // // // //         return res.status(200).json({ status: "ok" });
// // // // //       }

// // // // //       for (const body of messages) {
// // // // //         const from = body?.from || body?.phone || body?.sender || body?.mobile;
// // // // //         const messageText =
// // // // //           body?.text?.body || body?.body || body?.msg || req.body?.text;

// // // // //         if (!from || !messageText) {
// // // // //           console.log("⚠️ No 'from' or 'messageText' found, skipping.");
// // // // //           continue;
// // // // //         }

// // // // //         let parkingId = null;

// // // // //         // 1️⃣ Check if user clicked a button
// // // // //         if (body?.button?.payload) {
// // // // //           parkingId = body.button.payload;
// // // // //         }

// // // // //         // 2️⃣ Check if message is a reply to a template
// // // // //         if (!parkingId && body?.context?.id) {
// // // // //           parkingId = waMessageIdToParkingIdMap.get(body.context.id);
// // // // //         }

// // // // //         // 3️⃣ Extract 24-character MongoDB ObjectId from message text
// // // // //         if (!parkingId) {
// // // // //           const normalizedText = messageText.replace(/\s+/g, "").trim();
// // // // //           const match = normalizedText.match(/[a-f0-9]{24}/i);
// // // // //           parkingId = match ? match[0] : null;
// // // // //         }

// // // // //         if (!parkingId) {
// // // // //           console.log("⚠️ No parking ID found in message text:", messageText);
// // // // //           continue;
// // // // //         }

// // // // //         // Find parking document
// // // // //         // const parking = await Parking.findById(parkingId);
// // // // //         // if (!parking) {
// // // // //         //   console.log("❌ Parking not found for ID:", parkingId);
// // // // //         //   continue;
// // // // //         // }

// // // // //         if (!parkingId) {
// // // // //           const normalizedText = messageText.trim();
// // // // //           const match = normalizedText.match(/[a-f0-9]{23,24}/i);
// // // // //           parkingId = match ? match[0] : null;
// // // // //         }

// // // // //         if (!parkingId) {
// // // // //           console.log("⚠️ No parking ID found in message text:", messageText);
// // // // //           continue;
// // // // //         }

// // // // //         // Forward to Valley Boy
// // // // //         const valleyBoyId = parking.valleyBoyId?.toString();
// // // // //         const valleyBoySockets = io.valleyBoySockets || new Map();
// // // // //         const valleyBoySocketId = valleyBoySockets.get(valleyBoyId);

// // // // //         if (!valleyBoySocketId) {
// // // // //           console.log("⚠️ Valley Boy not connected for parking:", parkingId);
// // // // //           continue;
// // // // //         }

// // // // //         io.to(valleyBoySocketId).emit("incomingWhatsAppMessage", {
// // // // //           from,
// // // // //           message: messageText,
// // // // //           parkingId,
// // // // //           valleyBoyName: parking.valleyBoyName || "Valley Boy",
// // // // //         });

// // // // //         console.log(
// // // // //           "✅ WhatsApp message delivered to Valley Boy socket:",
// // // // //           valleyBoySocketId
// // // // //         );
// // // // //         console.log("Parking ID extracted:", parkingId);
// // // // //         console.log("Message text:", messageText);
// // // // //       }

// // // // //       res.status(200).json({ status: "ok" });
// // // // //     } catch (error) {
// // // // //       console.error("❌ Error in WhatsApp webhook:", error);
// // // // //       res.status(500).json({ status: "error", message: error.message });
// // // // //     }
// // // // //   };
// // // // // };

// // // // const {
// // // //   waMessageIdToParkingIdMap,
// // // // } = require("../controllers/parking.controller");
// // // // const Parking = require("../models/parking.model");

// // // // module.exports = function setupWhatsAppWebhook(io) {
// // // //   return async (req, res) => {
// // // //     try {
// // // //       console.log(
// // // //         "📩 Incoming WhatsApp payload:",
// // // //         JSON.stringify(req.body, null, 2)
// // // //       );

// // // //       // Normalize messages array
// // // //       const messages =
// // // //         req.body?.entry?.[0]?.changes?.[0]?.value?.messages ||
// // // //         req.body?.messages ||
// // // //         (req.body?.message ? [req.body.message] : []);

// // // //       if (!messages || messages.length === 0) {
// // // //         console.log("⚠️ No messages found in payload");
// // // //         return res.status(200).json({ status: "ok" });
// // // //       }

// // // //       for (const body of messages) {
// // // //         const from = body?.from || body?.phone || body?.sender || body?.mobile;
// // // //         const messageText =
// // // //           body?.text?.body || body?.body || body?.msg || req.body?.text;

// // // //         if (!from || !messageText) {
// // // //           console.log("⚠️ No 'from' or 'messageText' found, skipping.");
// // // //           continue;
// // // //         }

// // // //         let parkingId = null;

// // // //         // 1️⃣ Check if user clicked a button
// // // //         if (body?.button?.payload) {
// // // //           parkingId = body.button.payload;
// // // //         }

// // // //         // 2️⃣ Check if message is a reply to a template
// // // //         if (!parkingId && body?.context?.id) {
// // // //           parkingId = waMessageIdToParkingIdMap.get(body.context.id);
// // // //         }

// // // //         // 3️⃣ Extract 23 or 24-character MongoDB ObjectId from message text
// // // //         if (!parkingId) {
// // // //           const cleanedText = messageText.replace(/\s+/g, "").trim();
// // // //           console.log("🧪 Cleaned text for regex:", cleanedText);
// // // //           const match = cleanedText.match(/[a-f0-9]{23,24}/i);
// // // //           parkingId = match ? match[0] : null;
// // // //         }

// // // //         if (!parkingId) {
// // // //           console.log("⚠️ No parking ID found in message text:", messageText);
// // // //           continue;
// // // //         }

// // // //         // 4️⃣ Find parking document
// // // //         const parking = await Parking.findById(parkingId);
// // // //         // if (!parking) {
// // // //         //   console.log("❌ Parking not found for ID:", parkingId);
// // // //         //   continue;
// // // //         // }
// // // //         if (!parkingId) {
// // // //           const cleanedText = messageText.trim();
// // // //           console.log("🧪 Cleaned text for regex:", cleanedText);
// // // //           const match = cleanedText.match(/\b[a-f0-9]{23,24}\b/i);
// // // //           parkingId = match ? match[0] : null;
// // // //         }

// // // //         // 5️⃣ Forward to Valley Boy
// // // //         const valleyBoyId = parking.valleyBoyId?.toString();
// // // //         const valleyBoySockets = io.valleyBoySockets || new Map();
// // // //         const valleyBoySocketId = valleyBoySockets.get(valleyBoyId);

// // // //         if (!valleyBoySocketId) {
// // // //           console.log("⚠️ Valley Boy not connected for parking:", parkingId);
// // // //           continue;
// // // //         }

// // // //         io.to(valleyBoySocketId).emit("incomingWhatsAppMessage", {
// // // //           from,
// // // //           message: messageText,
// // // //           parkingId,
// // // //           valleyBoyName: parking.valleyBoyName || "Valley Boy",
// // // //         });

// // // //         console.log(
// // // //           "✅ WhatsApp message delivered to Valley Boy socket:",
// // // //           valleyBoySocketId
// // // //         );
// // // //         console.log("Parking ID extracted:", parkingId);
// // // //         console.log("Message text:", messageText);
// // // //       }

// // // //       res.status(200).json({ status: "ok" });
// // // //     } catch (error) {
// // // //       console.error("❌ Error in WhatsApp webhook:", error);
// // // //       res.status(500).json({ status: "error", message: error.message });
// // // //     }
// // // //   };
// // // // };

// // // const {
// // //   waMessageIdToParkingIdMap,
// // // } = require("../controllers/parking.controller");
// // // const Parking = require("../models/parking.model");

// // // module.exports = function setupWhatsAppWebhook(io) {
// // //   return async (req, res) => {
// // //     try {
// // //       console.log(
// // //         "📩 Incoming WhatsApp payload:",
// // //         JSON.stringify(req.body, null, 2)
// // //       );

// // //       // ✅ Normalize messages array
// // //       const messages =
// // //         req.body?.entry?.[0]?.changes?.[0]?.value?.messages ||
// // //         req.body?.messages ||
// // //         (req.body?.message ? [req.body.message] : []);

// // //       if (!messages || messages.length === 0) {
// // //         console.log("⚠️ No messages found in payload");
// // //         return res.status(200).json({ status: "ok" });
// // //       }

// // //       for (const body of messages) {
// // //         const from = body?.from || body?.phone || body?.sender || body?.mobile;
// // //         const messageText =
// // //           body?.text?.body || body?.body || body?.msg || req.body?.text;

// // //         if (!from || !messageText) {
// // //           console.log("⚠️ No 'from' or 'messageText' found, skipping.");
// // //           continue;
// // //         }

// // //         let parkingId = null;

// // //         // 1️⃣ Check if user clicked a button
// // //         if (body?.button?.payload) {
// // //           parkingId = body.button.payload;
// // //         }

// // //         // 2️⃣ Check if message is a reply to a template
// // //         if (!parkingId && body?.context?.id) {
// // //           parkingId = waMessageIdToParkingIdMap.get(body.context.id);
// // //         }

// // //         // 3️⃣ Extract parking ID from message text (robust way)
// // //         if (!parkingId) {
// // //           const rawText = (messageText || "").trim();
// // //           const regex = /[a-f0-9]{24}/gi;
// // //           const matches = rawText.match(regex);
// // //           if (matches && matches.length > 0) {
// // //             parkingId = matches[0];
// // //           }
// // //         }

// // //         if (!parkingId) {
// // //           console.log("⚠️ No parking ID found in message text:", messageText);
// // //           continue;
// // //         }

// // //         // 4️⃣ Fetch parking document
// // //         const parking = await Parking.findById(parkingId);
// // //         if (!parking) {
// // //           console.log("❌ Parking not found for ID:", parkingId);
// // //           continue;
// // //         }

// // //         // 5️⃣ Get Valley Boy socket
// // //         const valleyBoyId = parking.valleyBoyId?.toString();
// // //         const valleyBoySockets = io.valleyBoySockets || new Map();
// // //         const valleyBoySocketId = valleyBoySockets.get(valleyBoyId);

// // //         if (!valleyBoySocketId) {
// // //           console.log("⚠️ Valley Boy not connected for parking:", parkingId);
// // //           continue;
// // //         }

// // //         // 6️⃣ Forward message
// // //         io.to(valleyBoySocketId).emit("incomingWhatsAppMessage", {
// // //           from,
// // //           message: messageText,
// // //           parkingId,
// // //           valleyBoyName: parking.valleyBoyName || "Valley Boy",
// // //         });

// // //         console.log(
// // //           `✅ WhatsApp message delivered to Valley Boy socket: ${valleyBoySocketId}`
// // //         );
// // //         console.log("🆔 Parking ID extracted:", parkingId);
// // //         console.log("✉️ Message text:", messageText);
// // //       }

// // //       res.status(200).json({ status: "ok" });
// // //     } catch (error) {
// // //       console.error("❌ Error in WhatsApp webhook:", error);
// // //       res.status(500).json({ status: "error", message: error.message });
// // //     }
// // //   };
// // // };

// // const {
// //   waMessageIdToParkingIdMap,
// // } = require("../controllers/parking.controller");
// // const Parking = require("../models/parking.model");

// // module.exports = function setupWhatsAppWebhook(io) {
// //   return async (req, res) => {
// //     try {
// //       console.log(
// //         "📩 Incoming WhatsApp payload:",
// //         JSON.stringify(req.body, null, 2)
// //       );

// //       // Normalize messages array (to support different payload formats)
// //       const messages =
// //         req.body?.entry?.[0]?.changes?.[0]?.value?.messages ||
// //         req.body?.messages ||
// //         (req.body?.message ? [req.body.message] : []);

// //       if (!messages || messages.length === 0) {
// //         console.log("⚠️ No messages found in payload");
// //         return res.status(200).json({ status: "ok" });
// //       }

// //       for (const body of messages) {
// //         const from = body?.from || body?.phone || body?.sender || body?.mobile;
// //         const messageText =
// //           body?.text?.body || body?.body || body?.msg || req.body?.text;

// //         if (!from || !messageText) {
// //           console.log("⚠️ No 'from' or 'messageText' found, skipping.");
// //           continue;
// //         }

// //         let parkingId = null;

// //         // 1️⃣ Check if user clicked a button
// //         if (body?.button?.payload) {
// //           parkingId = body.button.payload;
// //         }

// //         // 2️⃣ Check if message is a reply to a template
// //         if (!parkingId && body?.context?.id) {
// //           parkingId = waMessageIdToParkingIdMap.get(body.context.id);
// //         }

// //         // 3️⃣ Try to extract parking ID from text
// //         if (!parkingId) {
// //           let rawText = (messageText || "")
// //             .normalize("NFKC") // normalize weird unicode characters
// //             .replace(/[\u200B-\u200D\uFEFF]/g, "") // remove zero-width spaces
// //             .trim();

// //           console.log("🧪 Cleaned text for regex:", JSON.stringify(rawText));

// //           // Debug: show char codes to find hidden chars
// //           console.log(
// //             "🔍 Char codes:",
// //             rawText.split("").map((c) => c.charCodeAt(0))
// //           );

// //           const regex = /\b[a-f0-9]{24}\b/i;
// //           const match = rawText.match(regex);

// //           if (match) {
// //             parkingId = match[0];
// //           }
// //         }

// //         // 🚨 If no parking ID found — skip message
// //         if (!parkingId) {
// //           console.log("⚠️ No parking ID found in message text:", messageText);
// //           continue;
// //         }

// //         console.log("✅ Extracted parking ID:", parkingId);

// //         // 4️⃣ Fetch parking info from DB
// //         const parking = await Parking.findById(parkingId);
// //         // if (!parking) {
// //         //   console.log("❌ Parking not found for ID:", parkingId);
// //         //   continue;
// //         // }

// //         if (!parkingId) {
// //           let rawText = (messageText || "")
// //             .normalize("NFKC")
// //             .replace(/[\u200B-\u200D\uFEFF]/g, "")
// //             .trim();

// //           console.log("🧪 Cleaned text for regex:", JSON.stringify(rawText));
// //           console.log(
// //             "🔍 Char codes:",
// //             rawText.split("").map((c) => c.charCodeAt(0))
// //           );

// //           // Accept 23 or 24 char hex strings
// //           const regex = /\b[a-f0-9]{23,24}\b/i;
// //           const match = rawText.match(regex);

// //           if (match) {
// //             parkingId = match[0];
// //           }
// //         }

// //         // 5️⃣ Forward message to the Valley Boy assigned to this parking
// //         const valleyBoyId = parking.valleyBoyId?.toString();
// //         const valleyBoySockets = io.valleyBoySockets || new Map();
// //         const valleyBoySocketId = valleyBoySockets.get(valleyBoyId);

// //         if (!valleyBoySocketId) {
// //           console.log("⚠️ Valley Boy not connected for parking:", parkingId);
// //           continue;
// //         }

// //         io.to(valleyBoySocketId).emit("incomingWhatsAppMessage", {
// //           from,
// //           message: messageText,
// //           parkingId,
// //           valleyBoyName: parking.valleyBoyName || "Valley Boy",
// //         });

// //         console.log(
// //           "✅ WhatsApp message delivered to Valley Boy socket:",
// //           valleyBoySocketId
// //         );
// //         console.log("📝 Message text:", messageText);
// //       }

// //       res.status(200).json({ status: "ok" });
// //     } catch (error) {
// //       console.error("❌ Error in WhatsApp webhook:", error);
// //       res.status(500).json({ status: "error", message: error.message });
// //     }
// //   };
// // };

// const Parking = require("../models/parking.model");
// const Message = require("../models/message.model"); // ✅ import your Message model
// const {
//   waMessageIdToParkingIdMap,
// } = require("../controllers/parking.controller");

// module.exports = function setupWhatsAppWebhook(io) {
//   return async (req, res) => {
//     try {
//       console.log(
//         "📩 Incoming WhatsApp payload:",
//         JSON.stringify(req.body, null, 2)
//       );

//       // ✅ Normalize messages array from webhook body
//       const messages =
//         req.body?.entry?.[0]?.changes?.[0]?.value?.messages ||
//         req.body?.messages ||
//         (req.body?.message ? [req.body.message] : []);

//       if (!messages || messages.length === 0) {
//         console.log("⚠️ No messages found in payload");
//         return res.status(200).json({ status: "ok" });
//       }

//       for (const body of messages) {
//         const from = body?.from || body?.phone || body?.sender || body?.mobile;
//         const messageText =
//           body?.text?.body || body?.body || body?.msg || req.body?.text;
//         const whatsappId = body?.id;

//         if (!from || !messageText) {
//           console.log("⚠️ No 'from' or 'messageText' found, skipping.");
//           continue;
//         }

//         // ✅ STEP 1: Extract parkingId
//         let parkingId = null;

//         // 1️⃣ If message came from button reply
//         if (body?.button?.payload) {
//           parkingId = body.button.payload;
//         }

//         // 2️⃣ If message is reply to a template
//         if (!parkingId && body?.context?.id) {
//           parkingId = waMessageIdToParkingIdMap.get(body.context.id);
//         }

//         // 3️⃣ Regex extract parking ID from message text
//         if (!parkingId) {
//           const rawText = (messageText || "")
//             .normalize("NFKC")
//             .replace(/[\u200B-\u200D\uFEFF]/g, "")
//             .trim();

//           console.log("🧪 Cleaned text for regex:", JSON.stringify(rawText));
//           console.log(
//             "🔍 Char codes:",
//             rawText.split("").map((c) => c.charCodeAt(0))
//           );

//           const regex = /\b[a-f0-9]{24}\b/i;
//           const match = rawText.match(regex);
//           if (match) parkingId = match[0];
//         }

//         if (!parkingId) {
//           console.log("⚠️ No parking ID found in message text:", messageText);
//           continue;
//         }

//         console.log("✅ Extracted parking ID:", parkingId);

//         // ✅ STEP 2: Get parking document
//         const parking = await Parking.findById(parkingId);
//         if (!parking) {
//           console.log("❌ Parking not found for ID:", parkingId);
//           continue;
//         }

//         // ✅ STEP 3: Save message to MongoDB
//         const savedMessage = await Message.create({
//           chatId: parking.chatId || parking._id, // depending on your chat structure
//           sender: {
//             userId: parking.userId || from, // WhatsApp user isn't in DB, so fallback to 'from'
//             userModel: "user",
//           },
//           text: messageText,
//           whatsappId,
//           fromNumber: from,
//         });

//         console.log("💾 WhatsApp message saved:", savedMessage._id.toString());

//         // ✅ STEP 4: Emit to Valley Boy socket
//         const valleyBoyId = parking.valleyBoyId?.toString();
//         const valleyBoySockets = io.valleyBoySockets || new Map();
//         const valleyBoySocketId = valleyBoySockets.get(valleyBoyId);

//         if (!valleyBoySocketId) {
//           console.log("⚠️ Valley Boy not connected for parking:", parkingId);
//           continue;
//         }

//         io.to(valleyBoySocketId).emit("incomingWhatsAppMessage", {
//           _id: savedMessage._id,
//           from,
//           message: messageText,
//           parkingId,
//           valleyBoyName: parking.valleyBoyName || "Valley Boy",
//           createdAt: savedMessage.createdAt,
//         });

//         console.log(
//           "✅ WhatsApp message delivered to Valley Boy socket:",
//           valleyBoySocketId
//         );
//       }

//       res.status(200).json({ status: "ok" });
//     } catch (error) {
//       console.error("❌ Error in WhatsApp webhook:", error);
//       res.status(500).json({ status: "error", message: error.message });
//     }
//   };
// };

const Parking = require("../models/parking.model");
const Message = require("../models/message.model");
const {
  waMessageIdToParkingIdMap,
} = require("../controllers/parking.controller");

module.exports = function setupWhatsAppWebhook(io) {
  return async (req, res) => {
    try {
      console.log(
        "📩 Incoming WhatsApp payload:",
        JSON.stringify(req.body, null, 2)
      );

      // Normalize messages array from webhook
      const messages =
        req.body?.entry?.[0]?.changes?.[0]?.value?.messages ||
        req.body?.messages ||
        (req.body?.message ? [req.body.message] : []);

      if (!messages || messages.length === 0) {
        console.log("⚠️ No messages found in payload");
        return res.status(200).json({ status: "ok" });
      }

      for (const body of messages) {
        const from = body?.from || body?.phone || body?.sender || body?.mobile;
        const messageText =
          body?.text?.body || body?.body || body?.msg || req.body?.text;
        const whatsappId = body?.id;

        if (!from || !messageText) {
          console.log("⚠️ No 'from' or 'messageText', skipping.");
          continue;
        }

        // STEP 1: Extract parkingId
        let parkingId = null;

        if (body?.button?.payload) parkingId = body.button.payload;
        if (!parkingId && body?.context?.id)
          parkingId = waMessageIdToParkingIdMap.get(body.context.id);

        if (!parkingId) {
          const rawText = (messageText || "")
            .normalize("NFKC")
            .replace(/[\u200B-\u200D\uFEFF]/g, "")
            .trim();
          const regex = /\b[a-f0-9]{24}\b/i;
          const match = rawText.match(regex);
          if (match) parkingId = match[0];
        }

        if (!parkingId) {
          console.log("⚠️ No parking ID found in message:", messageText);
          continue;
        }

        console.log("✅ Extracted parking ID:", parkingId);

        // STEP 2: Fetch parking
        const parking = await Parking.findById(parkingId);
        if (!parking) {
          console.log("❌ Parking not found for ID:", parkingId);
          continue;
        }

        // STEP 3: Save message
        const savedMessage = await Message.create({
          chatId: parking.chatId || parking._id,
          sender: {
            userId: parking.userId || from,
            userModel: "user",
          },
          text: messageText,
          whatsappId,
          fromNumber: from,
          deliveredTo: [], // track Valley Boys who have received this
        });

        console.log("💾 WhatsApp message saved:", savedMessage._id.toString());

        // STEP 4: Emit to Valley Boy if connected
        const valleyBoyId = parking.valleyBoyId?.toString();
        const valleyBoySockets = io.valleyBoySockets || new Map();
        const valleyBoySocketId = valleyBoySockets.get(valleyBoyId);

        if (valleyBoySocketId) {
          io.to(valleyBoySocketId).emit("incomingWhatsAppMessage", {
            _id: savedMessage._id,
            from,
            message: messageText,
            parkingId,
            valleyBoyName: parking.valleyBoyName || "Valley Boy",
            createdAt: savedMessage.createdAt,
          });

          // Mark as delivered
          savedMessage.deliveredTo.push(valleyBoyId);
          await savedMessage.save();

          console.log(
            "✅ WhatsApp message delivered to Valley Boy socket:",
            valleyBoySocketId
          );
        } else {
          console.log(
            "⚠️ Valley Boy not connected, message queued for offline delivery."
          );
        }
      }

      res.status(200).json({ status: "ok" });
    } catch (error) {
      console.error("❌ Error in WhatsApp webhook:", error);
      res.status(500).json({ status: "error", message: error.message });
    }
  };
};
