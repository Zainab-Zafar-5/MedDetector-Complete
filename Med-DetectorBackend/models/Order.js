const mongoose = require('mongoose');
 
const orderSchema = new mongoose.Schema({
    // ✅ ORDER IDENTIFICATION
    orderNumber: { 
        type: String, 
        unique: true,
        required: true
    },
 
    // ✅ PATIENT INFORMATION
    patientName: { 
        type: String, 
        required: true 
    },
    patientEmail: { 
        type: String,
        required: true 
    },
    patientPhone: { 
        type: String,
        required: true 
    },
    patientLocation: { 
        type: String,
        default: "Not specified"
    },
 
    // ✅ PHARMACY INFORMATION (CRITICAL FOR FILTERING)
    pharmacyName: { 
        type: String, 
        required: true,
        index: true
    },
    pharmacyEmail: {
        type: String
    },
    pharmacyPhone: {
        type: String
    },
 
    // ✅ MEDICINE INFORMATION
    medicineName: { 
        type: String, 
        required: true 
    },
    medicinePrice: {
        type: Number,
        default: 0
    },
    medicineStrength: {
        type: String,
        default: "N/A"
    },
    medicineCategory: {
        type: String,
        default: "General"
    },
 
    // ✅ PRESCRIPTION INFORMATION
    prescriptionUrl: { 
        type: String, 
        required: true 
    },
    prescriptionUploadedAt: {
        type: Date,
        default: Date.now
    },
 
    // ✅ ORDER DETAILS
    quantity: {
        type: Number,
        default: 1
    },
    totalPrice: {
        type: Number,
        default: 0
    },
    deliveryAddress: {
        type: String,
        default: "Not specified"
    },
    specialNotes: {
        type: String,
        default: ""
    },
 
    // ✅ ORDER STATUS
    status: { 
        type: String, 
        default: 'Pending',
        enum: ['Pending', 'Approved', 'Rejected', 'Completed'],
        index: true
    },
    approvedAt: {
        type: Date
    },
    approvedBy: {
        type: String
    },
 
    // ✅ METADATA
    userId: { 
        type: String,
        required: true 
    },
    orderDate: { 
        type: Date, 
        default: Date.now,
        index: true
    }
}, { 
    timestamps: true 
});
 
// ✅ INDEXES FOR FAST QUERIES
orderSchema.index({ pharmacyName: 1, status: 1 });
orderSchema.index({ pharmacyName: 1, orderDate: -1 });
 
module.exports = mongoose.model('Order', orderSchema);
