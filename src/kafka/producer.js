// src/kafka/producer.js

const kafka = require("./kafkaClient");

const producer = kafka.producer();

const connectProducer = async () => {
    try {
        await producer.connect();
        console.log("✅ Kafka Producer Connected");
    } catch (error) {
        console.error("❌ Kafka Producer Connection Failed:", error);
        process.exit(1);
    }
};

module.exports = {
    producer,
    connectProducer,
};