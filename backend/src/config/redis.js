const { createClient } = require("redis");

const redisClient = createClient({
    url: process.env.REDIS_URL,
});

redisClient.on("error", (err) => {
    console.error("Redis Error:", err);
});

redisClient.on("connect", () => {
    console.log("Redis Connected");
});

const connectRedis = async () => {
    await redisClient.connect();
};

module.exports = {
    redisClient,
    connectRedis,
};