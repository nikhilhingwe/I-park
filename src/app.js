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

// Replace these with your actual credentials
// const apiKey = "<YOUR_API_KEY>";
// const userId = "<YOUR_USER_ID>";
// const password = "<YOUR_PASSWORD>";
// const wabaNumber = "+918237329243"; // Your WhatsApp Business number

const apiUrl = "https://theultimate.io/WAApi/send";
const apiKey = "bc43bba92e4c5f824ae5287303892d89466f38c7"; // Replace with your API key
const userId = "parkobotswa"; // Replace with your user ID
const password = "parko@12"; // Replace with your password
const wabaNumber = "918237329243"; // Replace with your WhatsApp number

/**
 * Test function to send WhatsApp template message
 * @param {string} recipientNumber - User's mobile number in international format, without "+"
 * @param {string} templateName - Approved template name in TheUltimate.io
 * @param {Array<string>} templateParams - Array of parameters to fill in template placeholders
//  */
// async function testWhatsAppTemplateMessage(
//   recipientNumber,
//   templateName,
//   templateParams
// ) {
//   try {
//     // Remove any non-digit characters from recipient number
//     const formattedNumber = recipientNumber.replace(/\D/g, "");

//     const apiUrl = "https://theultimate.io/WAApi/send";

//     const params = {
//       apikey: apiKey,
//       userid: userId,
//       password: password,
//       wabaNumber: wabaNumber,
//       output: "json",
//       mobile: formattedNumber,
//       sendMethod: "quick",
//       msgType: "text", // Template message
//       msg: templateName,
//     };

//     // Add template parameters dynamically
//     templateParams.forEach((param, index) => {
//       params[`param${index + 1}`] = param;
//     });

//     const response = await axios.post(apiUrl, null, { params });

//     console.log("WhatsApp Template API Response:", response.data);
//   } catch (error) {
//     console.error(
//       "Error sending WhatsApp template message:",
//       error.response?.data || error.message
//     );
//   }
// }

// // Example usage
// const testNumber = "917276389688"; // recipient number with country code, no "+"
// const templateName = "test_template"; // Your approved template name
// const templateParams = ["John Doe", "MH12AB1234"]; // Parameters for placeholders in the template

// testWhatsAppTemplateMessage(testNumber, templateName, templateParams);

// async function testWhatsAppTemplateMessage(
//   recipientNumber,
//   templateName,
//   templateParams = []
// ) {
//   try {
//     // Remove any non-digit characters from recipient number
//     const formattedNumber = recipientNumber.replace(/\D/g, "");

//     const apiUrl = "https://theultimate.io/WAApi/send";

//     const params = {
//       apikey: apiKey,
//       userid: userId,
//       password: password,
//       wabaNumber: wabaNumber,
//       output: "json",
//       mobile: formattedNumber,
//       sendMethod: "quick",
//       msgType: "template", // <-- must be 'template' for template messages
//       msg: templateName,
//     };

//     // Add template parameters dynamically
//     templateParams.forEach((param, index) => {
//       params[`param${index + 1}`] = param;
//     });

//     const response = await axios.post(apiUrl, null, { params });

//     console.log("WhatsApp Template API Response:", response.data);
//   } catch (error) {
//     console.error(
//       "Error sending WhatsApp template message:",
//       error.response?.data || error.message
//     );
//   }
// }

// // Example usage
// const testNumber = "917276389688"; // recipient number with country code, no "+"
// const templateName = "test_template"; // your approved template on Ultimate.io
// const templateParams = ["John Doe", "MH12AB1234"]; // match template placeholders

// testWhatsAppTemplateMessage(testNumber, templateName, templateParams);

// async function sendWhatsAppMessage(
//   recipientNumber,
//   templateName,
//   templateParams = [],
//   fallbackText = ""
// ) {
//   try {
//     // Remove any non-digit characters
//     const formattedNumber = recipientNumber.replace(/\D/g, "");

//     const apiUrl = "https://theultimate.io/WAApi/send";

//     // Try template message first
//     const templateParamsObj = {};
//     templateParams.forEach((param, index) => {
//       templateParamsObj[`param${index + 1}`] = param;
//     });

//     const templatePayload = {
//       apikey: apiKey,
//       userid: userId,
//       password: password,
//       wabaNumber: wabaNumber,
//       output: "json",
//       mobile: formattedNumber,
//       sendMethod: "quick",
//       msgType: "template", // Template
//       msg: templateName,
//       ...templateParamsObj,
//     };

//     const templateResponse = await axios.post(apiUrl, null, {
//       params: templatePayload,
//     });

//     if (templateResponse.data.status === "success") {
//       console.log("Template message sent successfully:", templateResponse.data);
//       return templateResponse.data;
//     } else {
//       console.warn(
//         "Template message failed, falling back to text:",
//         templateResponse.data
//       );
//     }

//     // Fallback to text message if template fails
//     if (fallbackText) {
//       const textPayload = {
//         apikey: apiKey,
//         userid: userId,
//         password: password,
//         wabaNumber: wabaNumber,
//         output: "json",
//         mobile: formattedNumber,
//         sendMethod: "quick",
//         msgType: "text",
//         msg: fallbackText,
//       };

//       const textResponse = await axios.post(apiUrl, null, {
//         params: textPayload,
//       });
//       console.log("Text message sent successfully:", textResponse.data);
//       return textResponse.data;
//     } else {
//       console.error("No fallback text provided.");
//     }
//   } catch (err) {
//     console.error(
//       "Error sending WhatsApp message:",
//       err.response?.data || err.message
//     );
//   }
// }

// // Example usage:
// const recipient = "917276389688";
// const templateName = "test_template"; // your approved template
// const templateParams = ["John Doe", "MH12AB1234"];
// const fallbackText = `Hello John Doe, your car MH12AB1234 has been parked successfully.`;
// sendWhatsAppMessage(recipient, templateName, templateParams, fallbackText);

// import axios from "axios";

// // Example credentials (replace with your real ones)
// const apiKey = "YOUR_API_KEY";
// const userId = "YOUR_USER_ID";
// const password = "YOUR_PASSWORD";
// const wabaNumber = "YOUR_WABA_NUMBER";

/**
 * Send WhatsApp message using template, fallback to text if template fails
 * @param {string} recipientNumber - e.g., "917276389688"
 * @param {string} templateName - your approved template name
 * @param {Array<string>} templateParams - placeholders values
 */
// async function sendWhatsAppMessage(
//   recipientNumber,
//   templateName,
//   templateParams
// ) {
//   const formattedNumber = recipientNumber.replace(/\D/g, "");

//   // Build fallback text from templateParams
//   const fallbackText = templateParams.join(" ");

//   // Params for template message
//   const templateParamsObj = {};
//   templateParams.forEach((param, index) => {
//     templateParamsObj[`param${index + 1}`] = param;
//   });

//   const apiUrl = "https://theultimate.io/WAApi/send";

//   try {
//     // Try sending template first
//     const templateResponse = await axios.post(apiUrl, null, {
//       params: {
//         apikey: apiKey,
//         userid: userId,
//         password: password,
//         wabaNumber: wabaNumber,
//         output: "json",
//         mobile: formattedNumber,
//         sendMethod: "quick",
//         msgType: "template", // template message
//         msg: templateName,
//         ...templateParamsObj,
//       },
//     });

//     if (templateResponse.data.status === "success") {
//       console.log("Template message sent successfully:", templateResponse.data);
//       return templateResponse.data;
//     } else {
//       throw new Error("Template failed, fallback to text");
//     }
//   } catch (err) {
//     console.warn("Template message failed, falling back to text:", err.message);

//     // Send as text message instead
//     try {
//       const textResponse = await axios.post(apiUrl, null, {
//         params: {
//           apikey: apiKey,
//           userid: userId,
//           password: password,
//           wabaNumber: wabaNumber,
//           output: "json",
//           mobile: formattedNumber,
//           sendMethod: "quick",
//           msgType: "text",
//           msg: fallbackText,
//         },
//       });

//       console.log("Text message sent successfully:", textResponse.data);
//       return textResponse.data;
//     } catch (textErr) {
//       console.error(
//         "Error sending text message:",
//         textErr.response?.data || textErr.message
//       );
//       throw textErr;
//     }
//   }
// }

// // Example usage
// const recipient = "917276389688";
// const template = "i_park";
// const params = ["John Doe", "MH12AB1234"];

// sendWhatsAppMessage(recipient, template, params);

// async function sendReengagementWhatsApp(recipientNumber, userName, offer) {
//   try {
//     const formattedNumber = recipientNumber.replace(/\D/g, "");

//     const apiUrl = "https://theultimate.io/WAApi/send";

//     const params = {
//       apikey: apiKey,
//       userid: userId,
//       password: password,
//       wabaNumber: wabaNumber,
//       output: "json",
//       mobile: formattedNumber,
//       sendMethod: "quick",
//       msgType: "template", // template message
//       msg: "reengagement_template", // Your approved template name
//       param1: userName,
//       param2: offer,
//     };

//     const response = await axios.post(apiUrl, null, { params });

//     console.log("WhatsApp Template Response:", response.data);

//     if (response.data.status !== "success") {
//       console.warn("Template message failed, sending fallback text...");

//       // fallback text
//       const textParams = {
//         ...params,
//         msgType: "text",
//         msg: `Hi ${userName}, we miss you! ${offer}`,
//       };
//       delete textParams.param1;
//       delete textParams.param2;

//       const fallbackResponse = await axios.post(apiUrl, null, {
//         params: textParams,
//       });
//       console.log("Fallback Text Message Response:", fallbackResponse.data);
//     }
//   } catch (error) {
//     console.error(
//       "Error sending re-engagement message:",
//       error.response?.data || error.message
//     );
//   }
// }

// // Usage:
// sendReengagementWhatsApp(
//   "917276389688",
//   "John Doe",
//   "Check our latest offers!"
// );

// async function sendWhatsAppButtonTemplate(recipientNumber) {
//   try {
//     const formattedNumber = recipientNumber.replace(/\D/g, "");

//     const apiUrl = "https://theultimate.io/WAApi/send";

//     const params = {
//       apikey: apiKey, // your API key
//       userid: userId, // your user ID
//       password: password, // your password
//       wabaNumber: wabaNumber, // your WhatsApp number
//       output: "json",
//       mobile: formattedNumber,
//       sendMethod: "quick",
//       msgType: "template", // must be 'template' for template messages
//       templatename: "test_template",
//       category: "MARKETING", // your template category
//       header: "Test", // optional header
//       body: "test message", // template body
//       footer: "test footer", // optional footer
//       buttons1_type: "QUICK_REPLY", // button type
//       buttons1_title: "Hello", // button text
//       description: "test_template", // optional description
//     };

//     const response = await axios.post(apiUrl, null, { params });
//     console.log("WhatsApp Button Template Response:", response.data);

//     if (response.data.status !== "success") {
//       console.warn("Template failed, you may try fallback to text message");
//     }
//   } catch (error) {
//     console.error(
//       "Error sending WhatsApp button template:",
//       error.response?.data || error.message
//     );
//   }
// }

// // Example usage
// sendWhatsAppButtonTemplate("917276389688");
// import axios from "axios";

// const apiKey = "YOUR_API_KEY";
// const userId = "YOUR_USER_ID";
// const password = "YOUR_PASSWORD";
// const wabaNumber = "YOUR_WABA_NUMBER";

// async function sendWhatsAppTemplate(
//   recipientNumber,
//   templateName,
//   templateParams = []
// ) {
//   const formattedNumber = recipientNumber.replace(/\D/g, "");
//   const apiUrl = "https://theultimate.io/WAApi/send";

//   // Construct payload
//   const payload = {
//     apikey: apiKey,
//     userid: userId,
//     password: password,
//     wabaNumber: wabaNumber,
//     output: "json",
//     mobile: formattedNumber,
//     sendMethod: "quick",
//     msgType: "template",
//     templatename: templateName,
//     category: "MARKETING",
//   };

//   if (templateParams.length > 0) {
//     payload.body = templateParams.join(","); // Only if placeholders exist
//   }

//   try {
//     const response = await axios.post(apiUrl, null, { params: payload });
//     console.log("Template Message Response:", response.data);

//     if (response.data.status !== "success") {
//       throw new Error("Template failed, fallback to text");
//     }
//   } catch (err) {
//     console.warn("Template failed, falling back to text:", err.message);

//     // fallback to text
//     try {
//       const textPayload = {
//         apikey: apiKey,
//         userid: userId,
//         password: password,
//         wabaNumber: wabaNumber,
//         output: "json",
//         mobile: formattedNumber,
//         sendMethod: "quick",
//         msgType: "text",
//         msg: `Hello! Your parking details: ${templateParams.join(", ") || ""}`,
//       };
//       const textRes = await axios.post(apiUrl, null, { params: textPayload });
//       console.log("Text Message Response:", textRes.data);
//     } catch (textErr) {
//       console.error(
//         "Text fallback failed:",
//         textErr.response?.data || textErr.message
//       );
//     }
//   }
// }

// // Example usage
// // 1️⃣ Template without placeholders
// sendWhatsAppTemplate("917276389688", "i_park");

// // 2️⃣ Template with placeholders
// sendWhatsAppTemplate("917276389688", "i_park", ["John Doe", "MH12AB1234"]);

// import axios from "axios";

// Simple WhatsApp template message sender
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
