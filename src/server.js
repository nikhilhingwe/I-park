const express = require("express");
const http = require("http");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const initSocket = require("./config/socket");
const routes = require("./routes/index.route");
const setupWhatsAppWebhook = require("./routes/whatsAppwebHook");

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = initSocket(server);
app.set("io", io);

app.use(express.json());

app.use("/api", routes);
// app.post("/api/whatsapp-webhook", whatsappWebhook);
app.post("/api/whatsapp-webhook", setupWhatsAppWebhook(io));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
