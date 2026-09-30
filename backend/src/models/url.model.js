const mongoose = require("mongoose");

const urlSchema = new mongoose.Schema({

    // Original destination URL
    originalUrl: {
        type: String,
        required: true,
        trim: true
    },

    // Short code used in redirect
    shortCode: {
        type: String,
        required: true,
        unique: true,
        index: true
    },

    // Owner (for authentication feature)
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
        index: true
    },

    // Did user choose their own alias?
    isCustomAlias: {
        type: Boolean,
        default: false
    },

    // Click count
    clicks: {
        type: Number,
        default: 0
    },

    // URL status
    isActive: {
        type: Boolean,
        default: true
    },

    // Expiration
    expiresAt: {
        type: Date,
        default: null
    }

}, {
    timestamps: true
});

module.exports = mongoose.model("Url", urlSchema);