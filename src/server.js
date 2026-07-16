require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');
const { connectRedis } = require("./config/redis");

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        await connectDB();
        await connectRedis();

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();