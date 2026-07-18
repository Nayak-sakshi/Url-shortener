const express = require("express");

const validate = require("../middlewares/validate");
const authenticate = require("../middlewares/auth.middleware");

const { createShortUrlSchema, updateUrlSchema } = require("../validators/url.validator")
const router = express.Router();
const urlController = require("../controllers/url.controller");

router.post("/", validate(createShortUrlSchema), urlController.createShortUrl);
router.get("/:shortCode", urlController.redirect);
router.get("/my", authenticate, urlController.getMyUrls);
router.get("/:id", authenticate, urlController.getUrl);
router.patch("/:id", authenticate, validate(updateUrlSchema), urlController.updateUrl);
router.delete("/:id", authenticate, urlController.deleteUrl);


module.exports = router;
