require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');
const { connectRedis } = require("./config/redis");
const clickSyncWorker = require("./workers/clickSync.worker");

const PORT = process.env.PORT || 3000;
const CLICK_SYNC_INTERVAL_MS = Number(process.env.CLICK_SYNC_INTERVAL_MS) || 60000;


const startServer = async () => {
    try {
        await connectDB();
        await connectRedis();

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });

        // Flush clicks left over from a previous run, then keep syncing
        clickSyncWorker.syncClicks();

        setInterval(
            () => clickSyncWorker.syncClicks(),
            CLICK_SYNC_INTERVAL_MS
        );
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();