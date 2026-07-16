const express = require("express");

const errorHandler = require("./middlewares/errorHandler");

const app = express();

app.use(express.json());

// API Request Logger Middleware
app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
        const duration = Date.now() - start;
        console.log(` ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    });
    next();
});

// Define your routes here
const urlRoutes = require("./routes/url.routes");
app.use("/api/v1/urls", urlRoutes);


app.use(errorHandler);

module.exports = app;