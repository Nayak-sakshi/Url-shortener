const AppError = require("../errors/AppError");

const UserRepository = require("../repositories/user.repository");

const {
    verifyToken
} = require("../helpers/auth.helper");

const asyncHandler = require("../utils/asyncHandler");

const authenticate = asyncHandler(async (req, res, next) => {

    const authHeader = req.headers.authorization;

    if (
        !authHeader ||
        !authHeader.startsWith("Bearer ")
    ) {
        throw new AppError(
            "Authentication required",
            401
        );
    }

    const token = authHeader.split(" ")[1];

    const payload = verifyToken(token);

    const user =
        await UserRepository.findById(payload.id);

    if (!user) {
        throw new AppError(
            "User not found",
            401
        );
    }

    req.user = {
        id: user._id,
        email: user.email,
        role: user.role
    };

    next();

});

module.exports = authenticate;