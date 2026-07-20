const AppError = require("../errors/AppError");

const UserRepository = require("../repositories/user.repository");
const { verifyToken } = require("../helpers/auth.helper");
const asyncHandler = require("../utils/asyncHandler");

const authenticate = asyncHandler(async (req, res, next) => {

    const user = await getUserFromToken(req.headers.authorization);

    if (!user) {
        throw new AppError("Authentication required", 401);
    }

    req.user = user;

    next();

});
const optionalAuthenticate = asyncHandler(async (req, res, next) => {

    req.user = await getUserFromToken(req.headers.authorization);

    next();

});


module.exports = { authenticate, optionalAuthenticate };