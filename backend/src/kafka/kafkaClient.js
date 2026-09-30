const { Kafka } = require("kafkajs");

const kafka = new Kafka({
    clientId: "url-shortner",
    brokers: ["localhost:9092"],
});

module.exports = kafka;