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
        .optional()
});

const updateUrlSchema = Joi.object({

    originalUrl: Joi.string()
        .uri(),

    expiresAt: Joi.date()
        .allow(null)

}).min(1);

module.exports = {
    createShortUrlSchema
};