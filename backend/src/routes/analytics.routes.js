const express = require("express");

const router = express.Router();

const AnalyticsController = require("../controllers/analytics.controller");

const { authenticate } = require("../middlewares/auth.middleware");

router.get("/:urlId", authenticate, AnalyticsController.getAnalytics);

module.exports = router;