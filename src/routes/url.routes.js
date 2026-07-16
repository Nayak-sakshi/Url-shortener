const express = require("express");

const validate = require("../middlewares/validate");

const { createShortUrlSchema } = require("../validators/url.validator")
const router = express.Router();
const urlController = require("../controllers/url.controller");

router.post("/", validate(createShortUrlSchema), urlController.createShortUrl);
router.get("/:shortCode", urlController.redirect);


module.exports = router;
