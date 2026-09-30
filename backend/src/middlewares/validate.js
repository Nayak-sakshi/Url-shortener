const Apperror = require("../errors/AppError");

const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body);
        if (error) {
            return next(new Apperror(error.details[0].message, 400))
        }
        next();
    };
};

module.exports = validate;