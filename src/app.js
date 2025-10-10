const express = require("express");
const cors = require("cors");

const routes = require("./routes/index.route");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", routes);

module.exports = app;
