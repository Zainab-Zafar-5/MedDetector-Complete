const mongoose = require('mongoose');

// Replace the existing medicineSchema in index.js with this:
const medicineSchema = new mongoose.Schema({
    name: { type: String, required: true },
    genericName: { type: String, default: "N/A" },
    category: String,
    dosageForm: String,
    strength: String,
    indication: String,
    classification: String,
    company: String,
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
    expiryDate: { type: Date, required: true },
    batchNumber: String,
    pharmacyName: { type: String, required: true },
    licenseNo: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Medicine', medicineSchema);