const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const UserRepository = require("../repositories/user.repository");
const AppError = require("../errors/AppError");

const SALT_ROUNDS = 10;

const generateToken = (payload) => {
    return jwt.sign(
        payload,
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN
        }
    );
};
//  verifyToken = (token) => {
//     return jwt.verify(
//         token,
//         process.env.JWT_SECRET
//     );
// };
const verifyToken = (token) => {

    try {

        return jwt.verify(
            token,
            process.env.JWT_SECRET
        );

    } catch (error) {

        throw new AppError(
            "Invalid or expired token",
            401
        );

    }

};

const hashPassword = async (password) => {
    return bcrypt.hash(password, SALT_ROUNDS);
};

const comparePassword = async (password, hashedPassword) => {
    return bcrypt.compare(password, hashedPassword);
};
const buildAuthResponse = (user) => {

    const token = generateToken({
        id: user._id,
        email: user.email,
        role: user.role
    });

    return {
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        },
        token
    };
};
const getUserFromToken = async (authHeader) => {

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return null;
    }

    const token = authHeader.split(" ")[1];

    const payload = verifyToken(token);

    const user = await UserRepository.findById(payload.id);

    if (!user) {
        throw new AppError("User not found", 401);
    }

    return user;
};




module.exports = {
    buildAuthResponse,
    hashPassword,
    comparePassword,
    generateToken,
    verifyToken,
    getUserFromToken
};