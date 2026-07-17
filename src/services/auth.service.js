const UserRepository = require("../repositories/user.repository");
const AppError = require("../errors/AppError");

const {
    hashPassword,
    comparePassword,
    buildAuthResponse,
    generateToken
} = require("../helpers/auth.helper");

class AuthService {

    async register(data) {

        const {
            name,
            email,
            password
        } = data;

        // Check if email already exists
        const existingUser = await UserRepository.findByEmail(email);

        if (existingUser) {
            throw new AppError(
                "Email already registered",
                409
            );
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create user
        const user = await UserRepository.create({
            name,
            email,
            password: hashedPassword
        });

        // Generate JWT
        const token = generateToken({
            id: user._id,
            email: user.email,
            role: user.role
        });

        return buildAuthResponse(user);
    }

    async login(data) {

        const {
            email,
            password
        } = data;

        // Find user
        const user = await UserRepository.findByEmail(email);

        if (!user) {
            throw new AppError(
                "Invalid email or password",
                401
            );
        }

        // Compare password
        const isMatch = await comparePassword(
            password,
            user.password
        );

        if (!isMatch) {
            throw new AppError(
                "Invalid email or password",
                401
            );
        }

        // Generate token
        const token = generateToken({
            id: user._id,
            email: user.email,
            role: user.role
        });

        return buildAuthResponse(user);
    }
    async getProfile(userId) {

        const user =
            await UserRepository.findById(userId);

        if (!user) {
            throw new AppError(
                "User not found",
                404
            );
        }

        return {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        };

    }
}

module.exports = new AuthService();