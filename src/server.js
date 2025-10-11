const express = require("express");
const http = require("http");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const initSocket = require("./config/socket");
const routes = require("./routes/index.route");
const setupWhatsAppWebhook = require("./routes/whatsAppwebHook");
const setupWhatsAppInbound = require("./routes/whatsappInbound");

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = initSocket(server);
app.set("io", io);

app.use(express.json());

app.use("/api", routes);

app.post("/api/whatsapp-webhook", setupWhatsAppWebhook(io));
app.post("/api/whatsapp-incoming", setupWhatsAppInbound(io));

// app.post("/api/whatsapp-webhook", async (req, res) => {
//   console.log("Webhook hit! Payload:", JSON.stringify(req.body, null, 2));
//   res.sendStatus(200);
// });

// app.post("/api/whatsapp-webhook", async (req, res) => {
//   console.log(
//     "📩 Incoming WhatsApp payload:",
//     JSON.stringify(req.body, null, 2)
//   );

//   const messages = req.body.messages || [];
//   for (const body of messages) {
//     const from = body.from;
//     const messageText = body.text?.body || "";

//     // Try to extract 24-char MongoDB ObjectId as parkingId
//     const match = messageText.match(/\b[0-9a-fA-F]{24}\b/);
//     const parkingId = match ? match[0] : null;

//     if (!parkingId) {
//       console.log("⚠️ No parking ID found in message:", messageText);
//       continue;
//     }

//     const parking = await Parking.findById(parkingId);
//     if (!parking) {
//       console.log("❌ Parking not found for ID:", parkingId);
//       continue;
//     }

//     const valleyBoySocketId = io.valleyBoySockets.get(
//       parking.valleyBoyId?.toString()
//     );
//     if (!valleyBoySocketId) {
//       console.log("⚠️ Valley Boy not connected for parking:", parkingId);
//       continue;
//     }

//     io.to(valleyBoySocketId).emit("incomingWhatsAppMessage", {
//       from,
//       message: messageText,
//       parkingId,
//       valleyBoyName: parking.valleyBoyName || "Valley Boy",
//     });

//     console.log(
//       "✅ WhatsApp message delivered to Valley Boy socket:",
//       valleyBoySocketId
//     );
//   }

//   res.status(200).json({ status: "ok" });
// });

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
