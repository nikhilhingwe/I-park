const express = require("express");
const cors = require("cors");
const app = express();

const routes = require("../src/routes/index.route");
const { default: axios } = require("axios");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use combined routes
app.use("/api", routes);

const apiUrl = "https://theultimate.io/WAApi/send";
const apiKey = process.env.API_KEY_WABA; // Replace with your API key
const userId = process.env.WABA_USER; // Replace with your user ID
const password = process.env.WABA_PASSWORD; // Replace with your password
const wabaNumber = "918237329243"; // Replace with your WhatsApp number

async function sendWhatsAppTemplate(recipientNumber) {
  const formattedNumber = recipientNumber.replace(/\D/g, ""); // Remove any non-digit chars
  const apiUrl = "https://theultimate.io/WAApi/send";

  // Template payload
  const payload = {
    apikey: apiKey, // your Ultimate.io API key
    userid: userId, // your Ultimate.io user id
    password: password, // your Ultimate.io password
    wabaNumber: wabaNumber, // your WhatsApp Business number
    output: "json",
    mobile: formattedNumber,
    sendMethod: "quick",
    msgType: "template", // must be 'template' for approved templates
    templatename: "i_park", // your approved template name
    category: "MARKETING", // template category
  };

  try {
    const response = await axios.post(apiUrl, null, { params: payload });
    console.log("Template Message Response:", response.data);

    if (response.data.status !== "success") {
      console.warn("Template failed. You may need to check routing/approval.");
    }
  } catch (err) {
    console.error(
      "Error sending template message:",
      err.response?.data || err.message
    );
  }
}

// Example usage
sendWhatsAppTemplate("917276389688"); // Send simple i_park template

module.exports = app;
