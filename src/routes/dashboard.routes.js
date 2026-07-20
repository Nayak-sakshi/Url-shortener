const express = require("express");

const router = express.Router();

const DashboardController = require("../controllers/dashboard.controller");

const { authenticate } = require("../middlewares/auth.middleware");

router.get("/", authenticate, DashboardController.getDashboard);

module.exports = router;