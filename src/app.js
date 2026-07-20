const express = require("express");

const errorHandler = require("./middlewares/errorHandler");
const urlRoutes = require("./routes/url.routes");
const authRoutes = require("./routes/auth.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
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
app.use("/api/v1/urls", urlRoutes);

app.use("/api/v1/auth", authRoutes);

app.use("/api/v1/dashboard", dashboardRoutes);

app.use(errorHandler);

module.exports = app;