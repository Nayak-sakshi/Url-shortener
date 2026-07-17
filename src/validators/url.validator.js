const Joi = require("joi");

const createShortUrlSchema = Joi.object({
    originalUrl: Joi.string()
        .uri()
        .required(),

    expiresAt: Joi.date()
        .greater("now")
        .optional(),

    customAlias: Joi.string()
        .alphanum()
        .min(3)
        .max(30)
        .optional()
});

module.exports = {
    createShortUrlSchema
};