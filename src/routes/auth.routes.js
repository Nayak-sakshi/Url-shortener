const express = require("express");
const router = express.Router();

const AuthController = require("../controllers/auth.controller");
const validate = require("../middlewares/validate");
const { registerSchema, loginSchema } = require("../validators/auth.validator");
const authenticate = require("../middlewares/auth.middleware");


router.post("/register", validate(registerSchema), AuthController.register);

router.post("/login", validate(loginSchema), AuthController.login);

router.get("/profile", authenticate, AuthController.profile);

module.exports = router;