// const Parking = require("../models/parking.model"); // adjust path
// const ValleyBoy = require("../models/valleyboy.model");

// async function whatsappWebhook(req, res) {
//   try {
//     const { from, message } = req.body; // WA payload

//     // Extract parking ID from message
//     const match = message.match(/ID:\s*(\S+)/i);
//     if (!match) return res.status(400).json({ error: "Parking ID not found" });

//     const parkingId = match[1];
//     const parking = await Parking.findById(parkingId);
//     if (!parking) return res.status(404).json({ error: "Parking not found" });

//     // Get Valley Boy socket
//     const io = req.app.get("io");
//     const socketId = io.valleyBoySockets.get(parking.valleyBoyId);

//     if (socketId) {
//       io.to(socketId).emit("incomingWhatsAppMessage", {
//         from,
//         message,
//         parkingId,
//         valleyBoyName: parking.valleyBoyName || "Valley Boy",
//       });
//     }

//     res.status(200).json({ success: true });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// }

// module.exports = whatsappWebhook;

const express = require("express");
const router = express.Router();
const Parking = require("../models/parking.model");

// This function requires the `io` instance from your socket
function setupWhatsAppWebhook(io) {
  router.post("/whatsapp-webhook", async (req, res) => {
    try {
      // WhatsApp API usually sends "from" and "msg" or "text"
      const { from, msg } = req.body;
      if (!from || !msg)
        return res.status(400).json({ error: "Missing from or msg" });

      // Extract parking ID from the WhatsApp message
      // For example, message should contain: "ID: <parkingId>"
      const match = msg.match(/ID:\s*(\S+)/i);
      if (!match)
        return res
          .status(400)
          .json({ error: "Parking ID not found in message" });

      const parkingId = match[1];
      const parking = await Parking.findById(parkingId);
      if (!parking) return res.status(404).json({ error: "Parking not found" });

      // Send message to Valley Boy via socket
      io.emit("sendWhatsAppReply", {
        from,
        message: msg,
        parkingId,
      });

      return res.status(200).json({ success: true });
    } catch (err) {
      console.error("❌ WhatsApp webhook error:", err);
      return res.status(500).json({ error: err.message });
    }
  });

  return router;
}

module.exports = setupWhatsAppWebhook;
