const express = require("express");

const router = express.Router();
const urlController = require("../controllers/url.controller");
const rateLimiter = require("../middlewares/rateLimit.middleware");
const rateLimitConfig = require("../config/rateLimit.config");

// Short links at the root (BASE_URL/<shortCode>), same as GET /api/v1/urls/:shortCode
router.get(
  "/:shortCode",
  rateLimiter(rateLimitConfig.REDIRECT),
  urlController.redirect
);

module.exports = router;
