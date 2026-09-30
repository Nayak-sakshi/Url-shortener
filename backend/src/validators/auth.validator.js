const Joi = require("joi");

const registerSchema = Joi.object({

    name: Joi.string()
        .trim()
        .min(3)
        .max(50)
        .required(),

    email: Joi.string()
        .email()
        .required(),

    password: Joi.string()
        .min(6)
        .max(20)
        .required()

});

const loginSchema = Joi.object({

    email: Joi.string()
        .email()
        .required(),

    password: Joi.string()
        .required()

});

module.exports = {
    registerSchema,
    loginSchema
};