const Joi = require("joi");

const createShortUrlSchema = Joi.object({
    originalUrl: Joi.string().uri().required(), // must be the string, valid url, and required 
});

module.exports = {
    createShortUrlSchema
};