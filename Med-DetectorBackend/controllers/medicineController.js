const Medicine = require('../models/Medicine');

exports.getAlternatives = async (req, res) => {
    try {
        const { genericName, currentMedicineId } = req.query;

        // 1. Find alternatives with same generic name, excluding the current drug
        // 2. Ensure they are in stock
        const alternatives = await Medicine.find({
            genericName: { $regex: new RegExp(genericName, 'i') },
            _id: { $ne: currentMedicineId },
            stock: { $gt: 0 }
        })
        .limit(10)
        .sort({ price: 1 }); // Rank by cheapest first

        res.status(200).json({ success: true, data: alternatives });
    } catch (err) {
        res.status(500).json({ success: false, message: "Engine Failure: " + err.message });
    }
};