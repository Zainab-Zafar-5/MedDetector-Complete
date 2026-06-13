const mongoose = require('mongoose');

const PharmacySchema = new mongoose.Schema({
    pharmacyName: { type: String, required: true },
    licenseNumber: { type: String, required: true },
    ownerName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    city: { type: String, required: true },
    address: { type: String, required: true },
    status: { type: String, default: 'Pending' }, // For admin approval
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Pharmacy', PharmacySchema);