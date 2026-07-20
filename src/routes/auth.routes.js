const express = require("express");
const router = express.Router();

const AuthController = require("../controllers/auth.controller");
const validate = require("../middlewares/validate");
const { registerSchema, loginSchema } = require("../validators/auth.validator");
const {authenticate, optionalAuthenticate} = require("../middlewares/auth.middleware");
const rateLimiter = require("../middlewares/rateLimit.middleware");
const rateLimitConfig = require("../config/rateLimit.config");


router.post(
  "/register",
  rateLimiter(rateLimitConfig.REGISTER),
  validate(registerSchema),
  AuthController.register
);

router.post(
  "/login",
  rateLimiter(rateLimitConfig.LOGIN),
  validate(loginSchema),
  AuthController.login
);

router.get("/profile", authenticate, AuthController.profile);

module.exports = router;