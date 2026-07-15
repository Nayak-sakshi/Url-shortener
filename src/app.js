const express = require("express");

const errorHandler = require("./middlewares/errorHandler");

const app = express();

app.use(express.json());

// Define your routes here


app.use(errorHandler);

module.exports = app;