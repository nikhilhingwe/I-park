// routes/whatsappInbound.js
const Parking = require("../models/parking.model");
const Chat = require("../models/chatRoom.model");
const Message = require("../models/message.model");

/**
 * Extract sender and text from common webhook shapes.
 * Returns { from, text, raw } or { from: null, text: null, raw }
 */
function extractIncomingMessage(body) {
  // 1) WhatsApp Cloud API shape
  const waMsg =
    body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0] ||
    body?.messages?.[0] ||
    body?.message;

  // Use common field names
  const from =
    waMsg?.from ||
    waMsg?.sender ||
    waMsg?.wa_id ||
    waMsg?.phone ||
    waMsg?.mobile ||
    body?.from ||
    body?.msisdn;

  const text =
    waMsg?.text?.body ||
    waMsg?.body ||
    waMsg?.message ||
    body?.text ||
    body?.msg ||
    (typeof body === "string" ? body : null);

  return {
    from: from ? String(from) : null,
    text: text ? String(text) : null,
    raw: body,
  };
}

function normalizePhone(n) {
  if (!n) return null;
  return n.replace(/\D/g, "");
}

module.exports = function setupWhatsAppInbound(io) {
  return async (req, res) => {
    try {
      console.log(
        "📩 Incoming WhatsApp webhook payload:",
        JSON.stringify(req.body, null, 2)
      );

      const { from, text: messageText, raw } = extractIncomingMessage(req.body);

      if (!from || !messageText) {
        // ack the webhook but inform logs — many providers expect 200 quickly
        console.log("⚠️ Unrecognized payload shape or missing from/text.", {
          from,
          messageText,
          raw,
        });
        return res.status(200).send("ignored");
      }

      const formattedFrom = normalizePhone(from);
      console.log("🔎 Parsed from:", formattedFrom, "message:", messageText);

      // 1) Try to find an explicit parking ID in the incoming text (common format: "ID: 652bace1...")
      let match = messageText.match(/id\s*[:\-]?\s*([a-fA-F0-9]{24})/i); // mongo id (24 hex)
      if (!match) match = messageText.match(/id\s*[:\-]?\s*([A-Za-z0-9\-_]+)/i);

      let parking = null;
      if (match) {
        const parkingId = match[1];
        console.log("📌 Found parkingId in message:", parkingId);
        parking = await Parking.findById(parkingId);
      }

      // 2) If no ID found, try to find latest active parking for this phone number
      if (!parking) {
        // search by last N digits to account for country codes formatting differences
        const lookups = [];
        const last10 = formattedFrom.slice(-10);
        if (last10.length >= 6)
          lookups.push({ userNumber: { $regex: last10 + "$" } });
        if (formattedFrom.length >= 6)
          lookups.push({ userNumber: { $regex: formattedFrom + "$" } });

        if (lookups.length) {
          parking = await Parking.findOne({
            $or: lookups,
            isParked: true,
          }).sort({ createdAt: -1 });
        }
      }

      // 3) If still not found -> emit a generic event (admins / fallback) and ack
      if (!parking) {
        console.log(
          "⚠️ Parking not found for incoming message. Emitting fallback event."
        );
        // optional: emit to admins or log channel in app
        io.emit("incomingWhatsAppMessageUnknown", {
          from: formattedFrom,
          message: messageText,
          raw,
        });
        return res.status(200).send("parking_not_found");
      }

      // 4) Deliver to the valley boy mapped on parking
      const valleyBoyId = parking.valleyBoyId?.toString?.() || null;
      if (!valleyBoyId) {
        console.log(
          "⚠️ Parking found but no valleyBoy assigned:",
          parking._id.toString()
        );
        io.emit("incomingWhatsAppMessageUnassigned", {
          parkingId: parking._id.toString(),
          from: formattedFrom,
          message: messageText,
        });
        return res.status(200).send("no_valleyboy");
      }

      const valleyBoySockets = io.valleyBoySockets || new Map();
      const valleyBoySocketId = valleyBoySockets.get(valleyBoyId);

      // Optionally persist the inbound message into your chat system:
      try {
        // find or create chat between user and valleyboy (best-effort — adjust to your schema)
        let chat = await Chat.findOne({
          participants: {
            $all: [
              { $elemMatch: { userId: parking._id, userModel: "parking" } }, // adjust if you store userId differently
              { $elemMatch: { userId: valleyBoyId, userModel: "valleyboy" } },
            ],
          },
        });

        if (!chat) {
          // fallback: create chat between valleyboy and parking (if that makes sense in your data model)
          chat = await Chat.create({
            participants: [
              { userId: valleyBoyId, userModel: "valleyboy" },
              { userId: parking._id, userModel: "parking" },
            ],
            createdAt: new Date(),
          });
        }

        await Message.create({
          chatId: chat._id.toString(),
          text: messageText,
          sender: { userId: formattedFrom, userModel: "whatsapp" },
          deliveredTo: valleyBoySocketId ? [valleyBoyId] : [],
          readBy: [],
          createdAt: new Date(),
        });
      } catch (err) {
        console.warn(
          "⚠️ Could not persist incoming message to chat model:",
          err.message
        );
      }

      if (!valleyBoySocketId) {
        // Valley boy not connected — emit offline fallback
        console.log("⚠️ Valley Boy offline:", valleyBoyId);
        io.emit("incomingWhatsAppMessageOffline", {
          parkingId: parking._id.toString(),
          from: formattedFrom,
          message: messageText,
          valleyBoyId,
        });
        return res.status(200).send("valleyboy_offline");
      }

      // Send directly to the valley boy socket
      io.to(valleyBoySocketId).emit("incomingWhatsAppMessage", {
        parkingId: parking._id.toString(),
        from: formattedFrom,
        message: messageText,
        valleyBoyName: parking.valleyBoyName || "Valley Boy",
        timestamp: new Date(),
      });

      console.log(
        "✅ Delivered incoming WhatsApp to valley boy socket:",
        valleyBoySocketId
      );
      res.status(200).send("delivered");
    } catch (err) {
      console.error("❌ Error in whatsapp inbound handler:", err);
      // respond 200 often expected by webhook providers (they retry on non-200)
      res.status(500).send("error");
    }
  };
};
