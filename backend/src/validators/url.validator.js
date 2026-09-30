const Joi = require("joi");

const createShortUrlSchema = Joi.object({
    originalUrl: Joi.string()
        .uri()
        .required(),

    expiresAt: Joi.date()
        .allow(null),

    customAlias: Joi.string()
        .trim()
        .min(3)
        .max(30)
        .pattern(/^[a-zA-Z0-9-_]+$/)
        // 24-char hex values are routed as URL ids, not short codes
        .pattern(/^[0-9a-fA-F]{24}$/, { invert: true })
        .optional()
});

const updateUrlSchema = Joi.object({

    originalUrl: Joi.string()
        .uri(),

    expiresAt: Joi.date()
        .allow(null)

}).min(1);

module.exports = {
    createShortUrlSchema, updateUrlSchema
};