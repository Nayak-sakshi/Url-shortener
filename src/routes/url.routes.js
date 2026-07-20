const express = require("express");

const validate = require("../middlewares/validate");
const {authenticate, optionalAuthenticate} = require("../middlewares/auth.middleware");
const { createShortUrlSchema, updateUrlSchema } = require("../validators/url.validator")
const router = express.Router();
const urlController = require("../controllers/url.controller");
const rateLimiter = require("../middlewares/rateLimit.middleware");
const rateLimitConfig = require("../config/rateLimit.config");

router.post(
  "/",
  optionalAuthenticate,
  rateLimiter(rateLimitConfig.CREATE_URL),
  validate(createShortUrlSchema),
  urlController.createShortUrl
);

router.get("/my", authenticate, urlController.getMyUrls);
router.get("/:id", authenticate, urlController.getUrl);
router.patch("/:id", authenticate, validate(updateUrlSchema), urlController.updateUrl);
router.delete("/:id", authenticate, urlController.deleteUrl);

router.get(
  "/:shortCode",
  rateLimiter(rateLimitConfig.REDIRECT),
  urlController.redirect
);


module.exports = router;
