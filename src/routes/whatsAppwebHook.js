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
