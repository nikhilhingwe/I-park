// // // const Parking = require("../models/parking.model"); // adjust path
// // // const ValleyBoy = require("../models/valleyboy.model");

// // // async function whatsappWebhook(req, res) {
// // //   try {
// // //     const { from, message } = req.body; // WA payload

// // //     // Extract parking ID from message
// // //     const match = message.match(/ID:\s*(\S+)/i);
// // //     if (!match) return res.status(400).json({ error: "Parking ID not found" });

// // //     const parkingId = match[1];
// // //     const parking = await Parking.findById(parkingId);
// // //     if (!parking) return res.status(404).json({ error: "Parking not found" });

// // //     // Get Valley Boy socket
// // //     const io = req.app.get("io");
// // //     const socketId = io.valleyBoySockets.get(parking.valleyBoyId);

// // //     if (socketId) {
// // //       io.to(socketId).emit("incomingWhatsAppMessage", {
// // //         from,
// // //         message,
// // //         parkingId,
// // //         valleyBoyName: parking.valleyBoyName || "Valley Boy",
// // //       });
// // //     }

// // //     res.status(200).json({ success: true });
// // //   } catch (err) {
// // //     console.error(err);
// // //     res.status(500).json({ error: err.message });
// // //   }
// // // }

// // // module.exports = whatsappWebhook;

// // const express = require("express");
// // const router = express.Router();
// // const Parking = require("../models/parking.model");

// // // This function requires the `io` instance from your socket
// // function setupWhatsAppWebhook(io) {
// //   router.post("/whatsapp-webhook", async (req, res) => {
// //     try {
// //       // WhatsApp API usually sends "from" and "msg" or "text"
// //       const { from, msg } = req.body;
// //       if (!from || !msg)
// //         return res.status(400).json({ error: "Missing from or msg" });

// //       // Extract parking ID from the WhatsApp message
// //       // For example, message should contain: "ID: <parkingId>"
// //       const match = msg.match(/ID:\s*(\S+)/i);
// //       if (!match)
// //         return res
// //           .status(400)
// //           .json({ error: "Parking ID not found in message" });

// //       const parkingId = match[1];
// //       const parking = await Parking.findById(parkingId);
// //       if (!parking) return res.status(404).json({ error: "Parking not found" });

// //       // Send message to Valley Boy via socket
// //       io.emit("sendWhatsAppReply", {
// //         from,
// //         message: msg,
// //         parkingId,
// //       });

// //       return res.status(200).json({ success: true });
// //     } catch (err) {
// //       console.error("❌ WhatsApp webhook error:", err);
// //       return res.status(500).json({ error: err.message });
// //     }
// //   });

// //   return router;
// // }

// // module.exports = setupWhatsAppWebhook;

// const Parking = require("../models/parking.model");

// function setupWhatsAppWebhook(io) {
//   return async (req, res) => {
//     console.log("Webhook body:", req.body); // log incoming payload

//     try {
//       const { from, msg, text, message } = req.body;
//       const messageText = msg || text || message;

//       if (!from || !messageText)
//         return res.status(400).json({ error: "Missing from or message" });

//       const match = messageText.match(/ID:\s*(\S+)/i);
//       if (!match)
//         return res
//           .status(400)
//           .json({ error: "Parking ID not found in message" });

//       const parkingId = match[1];
//       const parking = await Parking.findById(parkingId);
//       if (!parking) return res.status(404).json({ error: "Parking not found" });

//       // emit to all sockets for now
//       io.emit("sendWhatsAppReply", { from, message: messageText, parkingId });

//       res.status(200).json({ success: true });
//     } catch (err) {
//       console.error("❌ WhatsApp webhook error:", err);
//       res.status(500).json({ error: err.message });
//     }
//   };
// }

// module.exports = setupWhatsAppWebhook;

// routes/whatsappWebhook.js
const Parking = require("../models/parking.model");

module.exports = function setupWhatsAppWebhook(io) {
  return async (req, res) => {
    try {
      console.log(
        "📩 Incoming WhatsApp payload:",
        JSON.stringify(req.body, null, 2)
      );

      // ✅ Support different payload shapes
      const body =
        req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0] ||
        req.body?.messages?.[0] ||
        req.body?.message ||
        req.body;

      const from =
        body?.from ||
        body?.phone ||
        body?.sender ||
        body?.mobile ||
        req.body?.from ||
        req.body?.phone;

      const messageText =
        body?.text?.body ||
        body?.body ||
        body?.msg ||
        req.body?.text ||
        req.body?.msg;

      if (!from || !messageText) {
        console.log("⚠️ No 'from' or 'messageText' found, skipping.");
        return res.status(200).send("ok");
      }

      // ✅ Extract parking ID (message like: "ID: 652bace1b0f09b1c88a8e0df")
      const match = messageText.match(/ID:\s*(\S+)/i);
      if (!match) {
        console.log("⚠️ No parking ID found in message text:", messageText);
        return res.status(200).send("no_id");
      }

      const parkingId = match[1];
      console.log("🆔 Extracted Parking ID:", parkingId);

      // ✅ Find parking entry
      const parking = await Parking.findById(parkingId);
      if (!parking) {
        console.log("❌ Parking not found for ID:", parkingId);
        return res.status(404).json({ error: "Parking not found" });
      }

      // ✅ Find Valley Boy socket
      const valleyBoyId = parking.valleyBoyId?.toString();
      const valleyBoySockets = io.valleyBoySockets || new Map();
      const valleyBoySocketId = valleyBoySockets.get(valleyBoyId);

      if (!valleyBoySocketId) {
        console.log("⚠️ Valley Boy not connected for parking:", parkingId);
        return res.status(200).send("valleyboy_offline");
      }

      // ✅ Emit message to Valley Boy app
      io.to(valleyBoySocketId).emit("incomingWhatsAppMessage", {
        from,
        message: messageText,
        parkingId,
        valleyBoyName: parking.valleyBoyName || "Valley Boy",
      });

      console.log(
        "✅ Message delivered to Valley Boy socket:",
        valleyBoySocketId
      );

      res.status(200).send("success");
    } catch (error) {
      console.error("❌ Error in WhatsApp webhook:", error.message);
      res.status(500).send("error");
    }
  };
};
