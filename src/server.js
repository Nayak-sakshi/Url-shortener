require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');
const { connectRedis } = require("./config/redis");
const clickSyncWorker = require("./workers/clickSync.worker");

const PORT = process.env.PORT || 3000;

// Start the server
const startServer = async () => {
    try {
        await connectDB();
        await connectRedis();

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });

        setInterval(async () => {
            await clickSyncWorker.syncClicks();
        }, 600000);
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();