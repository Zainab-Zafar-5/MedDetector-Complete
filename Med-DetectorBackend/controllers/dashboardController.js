const Medicine = require('../models/Medicine');

exports.getDashboardStats = async (req, res) => {
    try {
        // Database mein total medicines ki ginti
        const totalMedicines = await Medicine.countDocuments();
        
        // Low stock medicines (jin ki quantity 20 se kam hai)
        const lowStockList = await Medicine.find({ stock: { $lt: 20 } });

        res.json({
            success: true,
            data: {
                cards: {
                    totalMedicines,
                    totalRequests: 0, 
                    totalReservations: 0,
                    lowStock: lowStockList.length
                },
                notifications: [
                    { type: 'warn', icon: '⚠️', text: `${lowStockList.length} items low on stock`, time: 'Just now' }
                ]
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};