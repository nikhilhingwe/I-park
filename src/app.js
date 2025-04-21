const express = require("express");
const cors = require("cors");
const app = express();

const routes = require("../src/routes/index.route");

app.use(cors());
app.use(express.json());

// Use combined routes
app.use("/api", routes); 

module.exports = app;
