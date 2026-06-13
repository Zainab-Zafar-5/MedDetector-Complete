const fs = require('fs');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const path = require('path');

// --- 1. Model Import ---
const Medicine = require('../models/Medicine.js'); 

// --- 2. MongoDB Atlas Connection ---


mongoose.connect(atlasURI)
  .then(() => console.log("✅ Connected to MongoDB ATLAS..."))
  .catch(err => {
      console.error("❌ Connection Error!", err.message);
      process.exit(1);
  });

const results = [];
const seenMedicines = new Set(); 

// --- 3. CSV File Path ---
const csvFilePath = path.join(__dirname, '../data/medicine_dataset.csv');

console.log("🔍 CSV Path:", csvFilePath);

if (!fs.existsSync(csvFilePath)) {
    console.error("❌ File not found at path!");
    process.exit(1);
}

// --- 4. Processing ---
fs.createReadStream(csvFilePath)
  .pipe(csv())
  .on('data', (row) => {
    // Normalizing keys (CSV headers are Name, Strength, etc.)
    const rawName = row.Name || row.name;
    const rawStrength = row.Strength || row.strength || "N/A";

    if (rawName) {
      const uniqueKey = `${rawName}-${rawStrength}`.toLowerCase().trim();

      if (!seenMedicines.has(uniqueKey)) {
        seenMedicines.add(uniqueKey);

        // Generate Random Price and Stock
        const randomPrice = Math.floor(Math.random() * (1200 - 150 + 1)) + 150; 
        const randomStock = Math.floor(Math.random() * 100); 

        const medicineData = {
            name: rawName,
            category: row.Category,
            dosageForm: row['Dosage Form'],
            strength: rawStrength,
            indication: row.Indication,
            classification: row.Classification,
            price: randomPrice, 
            stock: randomStock,
            pharmacyName: "Health Care Pharmacy",
            location: "Lahore, Punjab",
            // Randomized Lahore Coordinates for Map Markers
            lat: 31.5204 + (Math.random() - 0.5) * 0.1, 
            lng: 74.3587 + (Math.random() - 0.5) * 0.1
        };
        
        results.push(medicineData); // Important: Adding to results array
      }
    }
  })
  .on('end', async () => {
    try {
      if (results.length === 0) {
          console.log("⚠️ No data found in CSV. Check headers.");
          process.exit(1);
      }

      console.log(`⏳ Cleaning old records...`);
      await Medicine.deleteMany({}); 
      
      console.log(`🚀 Uploading ${results.length} records to Atlas...`);
      // Chunking if data is too large, otherwise insertMany is fine
      await Medicine.insertMany(results);
      
      console.log(`✅ SUCCESS! Database updated with Prices, Stock and Coordinates.`);
      await mongoose.disconnect();
      process.exit(0);
    } catch (err) {
      console.error("❌ Database Error:", err.message);
      process.exit(1);
    }
  });