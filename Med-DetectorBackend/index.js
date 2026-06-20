require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const multer = require('multer'); 
const cors = require('cors');
const csv = require('csv-parser');
const fs = require('fs');

const bcrypt = require('bcrypt');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
// ----------------------------------------------

const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
const Order = require('./models/Order');


// Database Connection
mongoose.connect(process.env.MONGO_URI || "mongodb+srv://Zainab:Zainab123@cluster0.njhsoin.mongodb.net/?appName=Cluster0")
.then(() => console.log("✅ DB Connected Successfully"))
.catch(err => console.error("❌ DB Error:", err.message));
// --- 🔒 Stateful Interceptor Validation Guard (Middleware) ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: "Security Block: Authorization Token Missing!" });
    }

    jwt.verify(token, 'MED_DETECTOR_SECRET_KEY_2026', (err, decodedPayload) => {
        if (err) {
            return res.status(403).json({ success: false, message: "Security Block: Session Context Expired!" });
        }
        req.user = decodedPayload; 
        next(); 
    });
};

// --- 📦 Enterprise Multi-Tenant Mongoose Schemas ---
const medicineSchema = new mongoose.Schema({
    name: { type: String, required: true },
    genericName: { type: String, required: true }, 
    strength: { type: String, default: "" },      
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
    company: { type: String, default: "" },
    batchNumber: { type: String, default: "" },  
    expiryDate: { type: Date, required: true },   
    pharmacyName: { type: String, required: true },
    licenseNo: { type: String, required: true },
    location: { type: String, default: "" },
    category: { type: String, default: "General" },
    dosageForm: { type: String, default: "" },
    indication: { type: String, default: "" },
    classification: { type: String, default: "" },
    address: { type: String, default: "" },
    lat: { type: Number },
    lng: { type: Number }
}, { timestamps: true });


medicineSchema.index({ name: 'text', genericName: 'text' });
const Medicine = mongoose.models.Medicine || mongoose.model('Medicine', medicineSchema);

const adminSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, default: "System Administrator" },
    role: { type: String, default: "ADMIN" }
}, { timestamps: true });

const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);

const partnerSchema = new mongoose.Schema({
    password: { type: String, required: true },
    pharmacyName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    status: { type: String, default: 'Pending' }, 
    role: { type: String, default: 'PHARMACY_OWNER' },
    ownerName: String,
    phone: String,
    city: String,
    address: String,
    licenseNo: { type: String, required: true, unique: true }
}, { timestamps: true });

const Partner = mongoose.models.Partner || mongoose.model('Partner', partnerSchema);
// ✅ RESERVATION SCHEMA
const reservationSchema = new mongoose.Schema({
    pharmacyName: { type: String, required: true, index: true },
    name:     { type: String, required: true },
    email:    { type: String },
    phone:    { type: String },
    location: { type: String },
    medicine: { type: String, required: true },
    quantity: { type: Number, default: 1 },
    date:     { type: String },
    notes:    { type: String },
    status:   { type: String, default: 'upcoming', enum: ['upcoming', 'completed', 'cancelled'] }
}, { timestamps: true });

const Reservation = mongoose.models.Reservation || mongoose.model('Reservation', reservationSchema);



cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'prescriptions',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp']
  }
});

// Ab yahan variables define karein
const uploadCSV = multer({ dest: 'uploads/' });
const uploadCloud = multer({ storage: storage });

// ✅ MULTER ERROR HANDLER - Catches upload errors BEFORE route
app.use((err, req, res, next) => {
    // Only handle multer errors
    if (err.name === 'MulterError') {
        console.error("❌ Multer Error:", err.message);
        return res.status(400).json({ 
            success: false, 
            message: "File upload error: " + err.message 
        });
    }
    
    // Pass other errors to next handler
    next(err);
});
// Generate professional order number
function generateOrderNumber() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const timestamp = Date.now().toString().slice(-5);
  return `ORD-${year}${month}${day}-${timestamp}`;
}

// ==========================================
// 📥 MODULE C: STREAM PARSING BULK SEED ENGINE
// ==========================================
app.post('/api/medicines/bulk-import', authenticateToken, uploadCSV.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: "CSV file stream absent!" });
        const results = [];

        fs.createReadStream(req.file.path)
            .pipe(csv())
            .on('data', (row) => {
                const rawName = row.name || row['brand name'] || row.brand_name || row.Name;
                if (rawName) {
                    results.push({
                        name: rawName.trim(),
                        genericName: (row.genericName || row.generic || "General Clinical Formula").trim(), 
                        strength: row.strength || "—",
                        price: (() => {
                            const rawPrice = row.price ?? row.Price ?? row['Price (PKR)'] ?? row.MRP ?? row.mrp ?? row['Unit Price'] ?? row.cost ?? row.Cost;
                            const parsedPrice = parseFloat(rawPrice);
                            return Number.isFinite(parsedPrice) ? parsedPrice : Math.floor(150 + Math.random() * 1050);
                        })(),
                        stock: (() => {
                            const rawStock = row.stock ?? row.Stock ?? row.Quantity ?? row.quantity ?? row.Qty ?? row.qty;
                            const parsedStock = parseInt(rawStock, 10);
                            return Number.isFinite(parsedStock) ? parsedStock : Math.floor(10 + Math.random() * 90);
                        })(),
                        company: (row.company || "Generic Laboratories").trim(),
                        batchNumber: row.batchNumber || "BT-" + Math.floor(1000 + Math.random() * 9000),
                        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), 
                        pharmacyName: req.user.name,
                        licenseNo: req.user.licenseNo, 
                        location: row.location || row.city || req.user.city || "",
                        address: row.address || req.user.address || "",
                        status: 'Available'
                    });
                }
            })
            .on('end', async () => {
                try {
                    if (results.length > 0) await Medicine.insertMany(results);
                    fs.unlinkSync(req.file.path); 
                    res.json({ success: true, count: results.length });
                } catch (dbErr) { res.status(500).json({ success: false, message: dbErr.message }); }
            });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
    
});

// ✅ MINIMAL FIX FOR PRESCRIPTION UPLOAD ENDPOINT
// Replace lines 150-155 in your index.js with this code:

app.post('/api/prescriptions/upload', uploadCloud.single('prescription'), (req, res) => {
    try {
        console.log("📥 Upload request received");
        console.log("📂 req.file object:", JSON.stringify({
            exists: !!req.file,
            hasPath: !!req.file?.path,
            filename: req.file?.filename,
            originalname: req.file?.originalname
        }));
        
        // Check if file exists
        if (!req.file) {
            console.log("❌ No file in request");
            return res.status(400).json({ 
                success: false, 
                message: "No file provided" 
            });
        }

        // ✅ CRITICAL: Check if Cloudinary URL exists
        if (!req.file.path) {
            console.log("❌ Cloudinary upload failed - URL not available");
            console.log("Full req.file object:", req.file);
            return res.status(500).json({ 
                success: false, 
                message: "Cloudinary upload failed - unable to get image URL" 
            });
        }

        const cloudinaryUrl = req.file.path;
        
        // Validate URL format
        if (!cloudinaryUrl.includes('res.cloudinary.com')) {
            console.log("❌ Invalid Cloudinary URL format:", cloudinaryUrl);
            return res.status(500).json({ 
                success: false, 
                message: "Invalid Cloudinary URL received" 
            });
        }
        
        console.log("✅ Valid Cloudinary URL:", cloudinaryUrl);

        return res.status(200).json({ 
            success: true, 
            url: cloudinaryUrl,
            message: "Prescription uploaded successfully"
        });

    } catch (error) {
        console.error("❌ Upload Error:", error.message);
        console.error("Error stack:", error.stack);
        
        return res.status(500).json({ 
            success: false, 
            message: "Upload failed: " + error.message 
        });
    }
});


// ==========================================
// 📊 MODULE A: REAL-TIME DASHBOARD STATS PIPELINE
// ==========================================
app.get('/api/dashboard/stats', authenticateToken, async (req, res) => {
    try {
        const currentLicense = req.user && req.user.licenseNo ? req.user.licenseNo : "NOT_FOUND";
        const currentPharmacyName = req.user && req.user.name ? req.user.name : "NOT_FOUND";

        const isolationFilter = {
            $or: [ { licenseNo: currentLicense }, { pharmacyName: currentPharmacyName } ]
        };

        const today = new Date();
        const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

        const totalMedicines = await Medicine.countDocuments(isolationFilter);
        const lowStock = await Medicine.countDocuments({ ...isolationFilter, stock: { $lt: 20 } });
        const totalReservations = await Medicine.countDocuments({ ...isolationFilter, status: 'Pending' });

        const lowStockList = await Medicine.find({ ...isolationFilter, stock: { $lt: 20 } }).sort({ stock: 1 }).limit(15);
        
        const rawExpired = await Medicine.find({ ...isolationFilter, expiryDate: { $lt: today } });
        const rawExpiringSoon = await Medicine.find({ 
            ...isolationFilter, 
            expiryDate: { $gte: today, $lte: thirtyDaysFromNow } 
        }).sort({ expiryDate: 1 });

        const expiredMeds = rawExpired.map(m => ({
            name: m.name,
            stock: m.stock,
            expiry: m.expiryDate ? m.expiryDate.toISOString().split('T')[0] : "—"
        }));

        const expiryAlert = rawExpiringSoon.map(m => {
            const diffTime = Math.abs(new Date(m.expiryDate) - today);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return { name: m.name, stock: m.stock, daysLeft: diffDays };
        });

        const notifications = [];
        if (lowStock > 0) notifications.push({ text: `⚠️ Warning: You have ${lowStock} item(s) running low!` });
        if (expiredMeds.length > 0) notifications.push({ text: `❌ Alert: ${expiredMeds.length} medicine batch(es) expired!` });
        if (notifications.length === 0) notifications.push({ text: "✨ Operations Metrics Clear." });

        res.json({
            success: true,
            cards: { totalMedicines, totalRequests: 0, totalReservations, lowStock },
            lowStockList,
            notifications,
            expiredMeds,
            expiryAlert
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Dashboard Error: " + err.message });
    }
});

// ==========================================
// ➕ MODULE B: INVENTORY MANAGEMENT CRUD
// ==========================================
app.post('/api/medicines', authenticateToken, async (req, res) => {
    try {
        const secureProductBody = { 
            ...req.body, 
            pharmacyName: req.user.name, 
            licenseNo: req.user.licenseNo,
            location: req.body.location || req.user.city || "",
            address: req.body.address || req.user.address || ""
        };
        const newMed = new Medicine(secureProductBody);
        await newMed.save();
        res.json({ success: true, message: "Product committed successfully." });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.get('/api/medicines', authenticateToken, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 50; 
        const skip = (page - 1) * limit;
        const queryFilter = { $or: [ { licenseNo: req.user.licenseNo }, { pharmacyName: req.user.name } ] };

        const totalItems = await Medicine.countDocuments(queryFilter);
        const medicines = await Medicine.find(queryFilter).sort({ createdAt: -1 }).skip(skip).limit(limit);

        res.json({ success: true, data: medicines, totalPages: Math.ceil(totalItems / limit), currentPage: page, totalItems });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.put('/api/medicines/:id', authenticateToken, async (req, res) => {
    try {
        const updatedTarget = await Medicine.findOneAndUpdate({ _id: req.params.id, licenseNo: req.user.licenseNo }, req.body, { new: true });
        if (!updatedTarget) return res.status(403).json({ success: false, message: "Cross-tenant modification restricted!" });
        res.json({ success: true, message: "Record updated." });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.delete('/api/medicines/:id', authenticateToken, async (req, res) => {
    try {
        const deletedTarget = await Medicine.findOneAndDelete({ _id: req.params.id, licenseNo: req.user.licenseNo });
        if (!deletedTarget) return res.status(403).json({ success: false, message: "Cross-tenant resource clearing restricted!" });
        res.json({ success: true, message: "Asset cleared." });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});



// ==========================================
// 👤 MODULE D: COMPLETE PROFILE EXTRACTION LAYER
// ==========================================
app.get('/api/profile', authenticateToken, async (req, res) => {
    try {
        let userContext = await Partner.findById(req.user.id);
        let isAdminProfile = false;

        if (!userContext) { 
            userContext = await Admin.findById(req.user.id); 
            if (userContext) isAdminProfile = true;
        }

        if (!userContext) return res.status(404).json({ success: false, message: "Profile context registry missing." });

        res.json({
            success: true,
            data: {
                _id: userContext._id,
                name: isAdminProfile ? userContext.name : userContext.ownerName,
                pharmacyName: isAdminProfile ? "System Admin HQ" : userContext.pharmacyName,
                email: userContext.email,
                phone: userContext.phone || "—",
                city: userContext.city || "—",
                address: userContext.address || "—",
                licenseNo: isAdminProfile ? "HQ_MASTER" : userContext.licenseNo,
                status: isAdminProfile ? "Approved" : userContext.status,
                role: isAdminProfile ? "ADMIN" : "PHARMACY_OWNER"
            }
        });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});


// ========================================================
// 🔐 MODULE E: HYBRID IDENTITY MULTI-ROLE LOGIN ENGINE
// ========================================================
// ========================================================
// ========================================================
// 🔐 MODULE E: HYBRID IDENTITY MULTI-ROLE LOGIN ENGINE (DYNAMIC DB VERIFICATION)
// ========================================================
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Missing credentials fields." });
        }

        // Standard clean sanitization
        const cleanEmail = email.trim().toLowerCase();
        const inputPassword = password.trim();
        
        let targetUser = null;
        let finalRole = "";

        // 1️⃣ PURE DATABASE SEARCH FOR ADMIN (No hardcoded strings!)
        const adminUser = await Admin.findOne({ email: cleanEmail });
        
        if (adminUser) {
            let isAdminMatch = false;
            // Check matching database password (chahe text ho ya bcrypt string)
            if (adminUser.password.startsWith('$2b$') || adminUser.password.startsWith('$2a$')) {
                isAdminMatch = await bcrypt.compare(inputPassword, adminUser.password);
            } else {
                isAdminMatch = (inputPassword === adminUser.password.trim());
            }

            if (isAdminMatch) {
                targetUser = adminUser;
                finalRole = "ADMIN";
                console.log(`🎯 [DB AUTH SUCCESS] Admin verified directly from Database: ${adminUser.email}`);
            }
        }

        // 2️⃣ PURE DATABASE SEARCH FOR PARTNER (Execute if not admin)
        if (!targetUser) {
            const partnerUser = await Partner.findOne({ email: cleanEmail });
            if (partnerUser) {
                let isPartnerMatch = false;
                if (partnerUser.password.startsWith('$2b$') || partnerUser.password.startsWith('$2a$')) {
                    isPartnerMatch = await bcrypt.compare(inputPassword, partnerUser.password);
                } else {
                    isPartnerMatch = (inputPassword === partnerUser.password.trim());
                }

                if (isPartnerMatch) {
                    targetUser = partnerUser;
                    // Frontend compatible role mapping to prevent sidebar layout crashing
                    finalRole = "PARTNER"; 
                    console.log(`🎯 [DB AUTH SUCCESS] Partner verified directly from Database: ${partnerUser.email}`);
                }
            }
        }

        // 3️⃣ CRYPTOGRAPHIC REJECTION LAYER
        if (!targetUser) {
            console.log(`❌ [DB AUTH FAILURE] Email or Password mismatched for: ${cleanEmail}`);
            return res.status(401).json({ 
                success: false, 
                message: "Identity Matching Exception: Cryptographic credentials reject!" 
            });
        }

        // 4️⃣ ACCOUNT STATUS AUTHORIZATION GUARD
        if (finalRole !== "ADMIN" && targetUser.status !== "Approved") {
            return res.status(403).json({ 
                success: false, 
                message: `Access Revoked: Your registration parameter status is currently: ${targetUser.status}.` 
            });
        }

      // Map operational dynamic identities
        const dynamicName = finalRole === "ADMIN" ? (targetUser.name || "System Admin HQ") : (targetUser.pharmacyName || "Test Pharma");
        const dynamicLicense = finalRole === "ADMIN" ? "HQ_MASTER" : (targetUser.licenseNo || "N/A");
        const dynamicCity = finalRole === "ADMIN" ? "" : (targetUser.city || "");
        const dynamicAddress = finalRole === "ADMIN" ? "" : (targetUser.address || "");

 // 5️⃣ SIGN SECURE PAYLOAD TOKEN (Completion)
        const token = jwt.sign(
            { id: targetUser._id, role: finalRole, name: dynamicName, licenseNo: dynamicLicense, city: dynamicCity, address: dynamicAddress },
            'MED_DETECTOR_SECRET_KEY_2026',
            { expiresIn: '1d' }
        );

        // ✅ IMPORTANT: Send the response back to the Frontend
        return res.status(200).json({
            success: true,
            message: "Authentication Successful",
            token: token,
            user: {
                id: targetUser._id,
                role: finalRole,
                name: dynamicName,
                licenseNo: dynamicLicense,
                email: targetUser.email // Needed by your Sidebar/Profile components
            }
        });

    } catch (error) {
        console.error("🔥 INTERNAL SYSTEM ROUTER CRASH:", error.message);
        return res.status(500).json({ success: false, message: "System failure during login" });
    }
});
// ==========================================
// 🔍 MODULE F: PUBLIC System ROUTING INTERFACES
// ==========================================

app.post('/api/register-partner', async (req, res) => {
    try {
        const { pharmacyName, licenseNo, posSystem, ownerName, email, password, phone, city, address } = req.body;

        if (!pharmacyName || !licenseNo || !ownerName || !email || !password || !phone || !city || !address) {
            return res.status(400).json({ success: false, message: "All required fields must be filled." });
        }

        const existing = await Partner.findOne({ $or: [{ email }, { licenseNo }] });
        if (existing) {
            return res.status(400).json({ success: false, message: "Email or License Number already registered." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newPartner = new Partner({
            pharmacyName, licenseNo, ownerName, email,
            password: hashedPassword,
            phone, city, address,
            status: 'Pending'
        });

        await newPartner.save();

        res.json({ success: true, message: "Registration submitted successfully. Awaiting admin approval." });
    } catch (err) {
        res.status(500).json({ success: false, message: "Registration failed: " + err.message });
    }
});
app.get('/api/search', async (req, res) => {
    try {
        const { q } = req.query;
        let query = q ? { $or: [ { name: { $regex: q, $options: 'i' } }, { genericName: { $regex: q, $options: 'i' } } ] } : {};
        const data = await Medicine.find(query);
        res.json({ success: true, data });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/shortages', async (req, res) => {
    try {
        const shortages = await Medicine.find({ stock: { $lt: 20 } });
        res.json({ success: true, data: shortages });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
app.get('/api/admin/partners', async (req, res) => {
    try {
        const data = await Partner.find().sort({ createdAt: -1 });
        res.json({ success: true, data });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.patch('/api/admin/partners/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        await Partner.findByIdAndUpdate(req.params.id, { status });
        res.json({ success: true, message: `Target registration state mutated to: ${status}` });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

app.get('/api/alternatives', async (req, res) => {
    try {
        const { name, genericName } = req.query;

        if (!genericName) {
            return res.status(400).json({ success: false, message: "genericName is required" });
        }

        const safeGenericName = escapeRegex(genericName.trim());

        const alternatives = await Medicine.find({
            genericName: { $regex: new RegExp(safeGenericName, 'i') },
            name: { $ne: name },
            stock: { $gt: 0 } 
        });
        
        res.json({ success: true, data: alternatives });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});


app.post('/api/orders', async (req, res) => {
    try {
        console.log("📦 Order request received");
        
        const {
            patientName, patientEmail, patientPhone, patientLocation,
            pharmacyName, medicineName, medicinePrice, medicineStrength,
            medicineCategory, prescriptionUrl, quantity, totalPrice,
            deliveryAddress, specialNotes, userId,
            isManualEntry // ✅ true when added via Requests page "Add Manual Order"
                          // (walk-in / phone orders) — skips prescription
                          // verification and goes straight to the fulfillment
                          // pipeline (deliveryStatus: 'Pending').
        } = req.body;

        // ✅ VALIDATE REQUIRED FIELDS
        // Manual entries (walk-in orders added by the pharmacy) don't have a
        // patient-uploaded prescription, so prescriptionUrl isn't required
        // for those.
        const requiredFields = [
            { name: 'patientName', value: patientName },
            { name: 'patientEmail', value: patientEmail },
            { name: 'patientPhone', value: patientPhone },
            { name: 'pharmacyName', value: pharmacyName },
            { name: 'medicineName', value: medicineName },
        ];
        if (!isManualEntry) {
            requiredFields.push({ name: 'prescriptionUrl', value: prescriptionUrl });
        }

        const missingFields = requiredFields
            .filter(field => !field.value)
            .map(field => field.name);

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        if (!Order) {
            return res.status(503).json({
                success: false,
                message: "Database service unavailable"
            });
        }

        // ✅ GENERATE ORDER NUMBER
        const orderNumber = generateOrderNumber();

        // ✅ CREATE ORDER
        const newOrder = new Order({
            orderNumber: orderNumber,  // ⭐ PROFESSIONAL ORDER NUMBER
            patientName: patientName.trim(),
            patientEmail: patientEmail.trim(),
            patientPhone: patientPhone.trim(),
            patientLocation: patientLocation || "Not specified",
            pharmacyName: pharmacyName.trim(),  // ⭐ MUST MATCH EXACTLY
            medicineName: medicineName.trim(),
            medicinePrice: Number(medicinePrice) || 0,
            medicineStrength: medicineStrength || "N/A",
            medicineCategory: medicineCategory || "General",
            prescriptionUrl: prescriptionUrl ? prescriptionUrl.trim() : "Not Required (Manual Entry)",
            quantity: Number(quantity) || 1,
            totalPrice: Number(totalPrice) || 0,
            deliveryAddress: deliveryAddress ? deliveryAddress.trim() : "Not specified",
            specialNotes: specialNotes || "",
            userId: userId || "guest_user",
            // ✅ Manual entries skip prescription verification entirely and
            // go straight into the Requests/fulfillment pipeline.
            status: isManualEntry ? 'Approved' : 'Pending',
            deliveryStatus: 'Pending'
        });

        await newOrder.save();

        console.log("✅ ORDER SAVED SUCCESSFULLY:");
        console.log(`   Order Number: ${orderNumber}`);
        console.log(`   Patient: ${patientName}`);
        console.log(`   Pharmacy: ${pharmacyName}`);
        console.log(`   Medicine: ${medicineName}`);
        console.log(`   Order ID: ${newOrder._id}`);

        res.status(201).json({
            success: true,
            message: "Order placed successfully!",
            orderNumber: orderNumber,  // ⭐ SEND TO FRONTEND
            orderId: newOrder._id,
            data: newOrder
        });

    } catch (err) {
        console.error("❌ Order creation error:", err);
        res.status(500).json({
            success: false,
            message: "Failed to create order: " + err.message
        });
    }
});

// ========================================
// ✅ REPLACE GET /api/orders ENDPOINT
// ========================================

app.get('/api/orders', async (req, res) => {
    try {
        const { pharmacy } = req.query;

        console.log("📋 Fetching orders for pharmacy:", pharmacy);

        if (!Order) {
            return res.status(503).json({
                success: false,
                message: "Database unavailable"
            });
        }

        if (!pharmacy) {
            return res.status(400).json({
                success: false,
                message: "Pharmacy name required in query"
            });
        }

        // ✅ QUERY WITH EXACT MATCH
        const orders = await Order.find({ 
            pharmacyName: pharmacy
        })
        .sort({ createdAt: -1 })
        .limit(100);

        console.log(`✅ Found ${orders.length} orders for "${pharmacy}"`);

        res.json({
            success: true,
            data: orders,
            count: orders.length,
            pharmacy: pharmacy
        });

    } catch (err) {
        console.error("❌ Orders fetch error:", err);
        res.status(500).json({
            success: false,
            message: "Failed to fetch orders: " + err.message
        });
    }
});

// ========================================
// ✅ REPLACE PATCH /api/orders/:id ENDPOINT
// ========================================

app.patch('/api/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, deliveryStatus } = req.body;

    console.log(`📝 Updating order ${id} -> status: ${status}, deliveryStatus: ${deliveryStatus}`);

    // Validate MongoDB ObjectId
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid order ID" });
    }

    // ✅ Build update object dynamically — only touch the fields that were sent.
    // This keeps prescription-verification status (Prescriptions page) and
    // delivery/fulfillment status (Requests page) completely independent.
    const updateFields = {};

    if (status !== undefined) {
      updateFields.status = status;
      updateFields.approvedAt = new Date();
      updateFields.approvedBy = "Pharmacy Admin";
    }

    if (deliveryStatus !== undefined) {
      updateFields.deliveryStatus = deliveryStatus;
    }

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ success: false, message: "No valid fields to update (expected 'status' or 'deliveryStatus')" });
    }

    // Update order with new status
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      updateFields,
      { new: true, runValidators: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    console.log(`✅ Order updated successfully:`, updatedOrder);

    res.json({
      success: true,
      message: `Order updated successfully`,
      data: updatedOrder,
      orderNumber: updatedOrder.orderNumber
    });

  } catch (err) {
    console.error("❌ Error updating order:", err);
    res.status(500).json({
      success: false,
      message: "Error updating order: " + err.message
    });
  }
});

// ✅ DELETE an order (used by the Requests page "🗑️" button)
app.delete('/api/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid order ID" });
    }

    const deleted = await Order.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.json({ success: true, message: "Order deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting order:", err);
    res.status(500).json({
      success: false,
      message: "Error deleting order: " + err.message
    });
  }
});
// ✅ RESERVATIONS API

app.get('/api/reservations', authenticateToken, async (req, res) => {
  try {
    const reservations = await Reservation.find({ pharmacyName: req.user.name })
      .sort({ createdAt: -1 });
    res.json({ success: true, data: reservations });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching reservations: " + err.message });
  }
});

app.post('/api/reservations', authenticateToken, async (req, res) => {
  try {
    const { name, email, phone, location, medicine, quantity, date, notes } = req.body;
    if (!name || !medicine) {
      return res.status(400).json({ success: false, message: "Customer name and medicine are required" });
    }
    const newReservation = new Reservation({
      pharmacyName: req.user.name,
      name, email, phone, location, medicine,
      quantity: Number(quantity) || 1,
      date, notes,
      status: 'upcoming'
    });
    await newReservation.save();
    res.json({ success: true, data: newReservation });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error creating reservation: " + err.message });
  }
});

app.patch('/api/reservations/:id', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await Reservation.findOneAndUpdate(
      { _id: req.params.id, pharmacyName: req.user.name },
      { status },
      { new: true }
    );
    if (!updated) return res.status(404).json({ success: false, message: "Reservation not found" });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error updating reservation: " + err.message });
  }
});

app.delete('/api/reservations/:id', authenticateToken, async (req, res) => {
  try {
    const deleted = await Reservation.findOneAndDelete({ _id: req.params.id, pharmacyName: req.user.name });
    if (!deleted) return res.status(404).json({ success: false, message: "Reservation not found" });
    res.json({ success: true, message: "Reservation deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error deleting reservation: " + err.message });
  }
});

// ============================================
// ✅ ALSO ADD THIS GET ENDPOINT FOR PRESCRIPTION
// ============================================

app.get('/api/orders/:id/prescription', async (req, res) => {
  try {
    const { id } = req.params;
    const mongoose = require('mongoose');

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid order ID" });
    }

    const order = await Order.findById(id);

    if (!order || !order.prescriptionUrl) {
      return res.status(404).json({ success: false, message: "Prescription not found" });
    }

    res.json({
      success: true,
      prescriptionUrl: order.prescriptionUrl,
      patientName: order.patientName,
      medicineName: order.medicineName
    });

  } catch (err) {
    console.error("Error fetching prescription:", err);
    res.status(500).json({ success: false, message: "Error fetching prescription" });
  }
});



app.listen(PORT, () => console.log(`✅ ENGINE RUNNING SECURELY ON PORT: ${PORT}`));