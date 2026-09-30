const mongoose = require("mongoose");

const clickSchema = new mongoose.Schema({

    urlId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Url",
        required: true,
        index: true
    },

    shortCode: {
        type: String,
        required: true,
        index: true
    },

    clickedAt: {
        type: Date,
        default: Date.now,
        index: true
    }

}, {
    timestamps: false
});

module.exports = mongoose.model("Click", clickSchema);