import React, { useState, useEffect, useRef } from 'react';
import { Search as SearchIcon, MapPin, Phone, Loader2, Pill, Info, X, Mail, ShieldCheck, Upload, Clock } from 'lucide-react';
import styles from './SearchResults.module.css';
import Alternative from './Alternative';
import OrderFormModal from "./OrderFormModal";

const SearchComponent = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [showModal, setShowModal] = useState(false);
  const [selectedMed, setSelectedMed] = useState(null);
  const [showAltModal, setShowAltModal] = useState(false);
  const [selectedMedName, setSelectedMedName] = useState('');
  const [selectedGenericName, setSelectedGenericName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [prescriptionUrl, setPrescriptionUrl] = useState('');
  const [orderProcessing, setOrderProcessing] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
const [orderConfirmation, setOrderConfirmation] = useState(null);
const [showConfirmation, setShowConfirmation] = useState(false);
const [uploadProgress, setUploadProgress] = useState(0);
const [highlightedMed, setHighlightedMed] = useState(null);
const cardRefs = useRef({});

  // ✅ PERFORMANCE FIX: Compress/resize image in the browser before upload.
  // Phone-camera prescription photos are often 3-8MB at 3000x4000px.
  // Resizing to a max of 1280px and re-encoding as JPEG (quality 0.7)
  // typically shrinks the file to 150-400KB, making the upload
  // (browser -> backend -> Cloudinary) 10-20x faster.
  const compressImage = (file, maxDimension = 1280, quality = 0.7) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target.result;
      };
      reader.onerror = reject;

      img.onload = () => {
        let { width, height } = img;

        if (width > height && width > maxDimension) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else if (height > maxDimension) {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff'; // flatten transparency for PNG -> JPEG
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Image compression failed'));
              return;
            }
            const compressedFile = new File(
              [blob],
              file.name.replace(/\.\w+$/, '.jpg'),
              { type: 'image/jpeg' }
            );
            resolve(compressedFile);
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = reject;

      reader.readAsDataURL(file);
    });
  };

  // ✅ Upload with progress tracking (XMLHttpRequest gives upload progress;
  // fetch() does not). Image is compressed client-side first.
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert("❌ Please select an image file (JPG, PNG, etc.)");
      return;
    }

    // Validate original file size (5MB max, before compression)
    if (file.size > 5 * 1024 * 1024) {
      alert("❌ File too large. Maximum size is 5MB");
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      // 1️⃣ Compress before upload
      const originalSizeKB = (file.size / 1024).toFixed(0);
      const compressedFile = await compressImage(file);
      const compressedSizeKB = (compressedFile.size / 1024).toFixed(0);
      console.log(`🗜️ Compressed: ${originalSizeKB}KB -> ${compressedSizeKB}KB`);

      const formData = new FormData();
      formData.append('prescription', compressedFile);

      // 2️⃣ Upload with progress via XMLHttpRequest
      const data = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'http://localhost:5000/api/prescriptions/upload');

        xhr.upload.onprogress = (evt) => {
          if (evt.lengthComputable) {
            const pct = Math.round((evt.loaded / evt.total) * 100);
            setUploadProgress(pct);
          }
        };

        xhr.onload = () => {
          try {
            resolve(JSON.parse(xhr.responseText));
          } catch (err) {
            reject(err);
          }
        };
        xhr.onerror = () => reject(new Error('Network error during upload'));

        xhr.send(formData);
      });

      console.log("📦 Response data:", data);

      if (data.success) {
        setPrescriptionUrl(data.url);
      } else {
        alert("❌ Upload failed: " + (data.message || "Unknown error"));
        console.error("Backend Error:", data.message);
      }
    } catch (err) {
      alert("❌ Network error during upload");
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  
// ✅ FIXED handleConfirmOrder FUNCTION
const handleConfirmOrder = async (formData) => {
  // ✅ IMPROVED VALIDATION - Check for empty or whitespace
  if (!prescriptionUrl || prescriptionUrl.trim() === '') {
    alert("⚠️ Please upload prescription first!");
    return;
  }

  if (!selectedMed) {
    alert("⚠️ No medicine selected!");
    return;
  }

  setOrderProcessing(true);

  try {
    // ✅ GET EXACT PHARMACY NAME
    const pharmacyName = selectedMed.pharmacyName || selectedMed.pharmacy || "Unknown Pharmacy";
    
    // ✅ CREATE COMPLETE ORDER PAYLOAD
    const orderPayload = {
      patientName: formData.patientName,
      patientEmail: formData.patientEmail,
      patientPhone: formData.patientPhone,
      patientLocation: formData.patientLocation,
      pharmacyName: pharmacyName,  // ⭐ EXACT MATCH
      medicineName: selectedMed.name,
      medicinePrice: selectedMed.price || 0,
      medicineStrength: selectedMed.strength || "N/A",
      medicineCategory: selectedMed.category || "General",
      prescriptionUrl: prescriptionUrl,
      quantity: 1,
      totalPrice: (selectedMed.price || 0) * 1,
      deliveryAddress: formData.deliveryAddress,
      specialNotes: formData.specialNotes,
      userId: "user_" + Date.now()
    };

    console.log("✅ Complete order payload:", orderPayload);

    const response = await fetch('http://localhost:5000/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload)
    });

    const result = await response.json();

    if (result.success) {
      // ✅ SHOW CONFIRMATION WITH FULL ORDER DETAILS
      setOrderConfirmation({
        orderNumber: result.orderNumber,
        patientName: formData.patientName,
        patientEmail: formData.patientEmail,
        patientPhone: formData.patientPhone,
        patientLocation: formData.patientLocation,
        deliveryAddress: formData.deliveryAddress,
        specialNotes: formData.specialNotes,
        medicineName: selectedMed.name,
        medicineStrength: selectedMed.strength || "N/A",
        medicineCategory: selectedMed.category || "General",
        pharmacyName: pharmacyName,
        quantity: 1,
        totalPrice: selectedMed.price || 0,
        orderDate: new Date().toLocaleString('en-PK', {
          dateStyle: 'medium',
          timeStyle: 'short'
        })
      });
      setShowConfirmation(true);
      setShowOrderForm(false);
      setShowModal(false); // ✅ FIX: close the "Verification Required" modal too,
                            // otherwise it re-appears on top of (and hides) the
                            // confirmation modal due to its higher z-index.

      // ✅ FIX: No auto-close timer anymore — the confirmation now stays
      // visible until the user clicks "Back to Search", giving them time
      // to read the details or take a screenshot / print the receipt.
    } else {
      alert("❌ Order failed: " + (result.message || "Unknown error"));
    }

  } catch (err) {
    alert("❌ Network error during order placement");
    console.error("Order error:", err);
  } finally {
    setOrderProcessing(false);
  }
};

// ✅ ADD THIS CONFIRMATION MODAL COMPONENT
const OrderConfirmationModal = ({ data, onClose }) => {
  if (!data) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0, 0, 0, 0.6)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 999999, // ✅ Highest z-index so it always renders above the
                       // verification modal (9999) and OrderFormModal (99999)
      padding: "16px",
      overflow: "auto"
    }}>
      {/* Print-only styles: hide everything except the receipt when printing */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #order-receipt, #order-receipt * { visibility: visible; }
          #order-receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            max-height: none !important;
            box-shadow: none !important;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      <div id="order-receipt" style={{
        background: "white",
        borderRadius: "16px",
        padding: "24px 28px",
        maxWidth: "480px",
        width: "95%",
        maxHeight: "95vh",
        overflowY: "auto",
        textAlign: "center",
        margin: "auto"
      }}>
        {/* Success Icon + Heading (compact, side by side) */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "4px" }}>
          <span style={{ fontSize: "28px" }}>✅</span>
          <h2 style={{
            fontSize: "22px",
            fontWeight: "800",
            color: "#0f172a",
            margin: 0
          }}>
            Order Confirmed!
          </h2>
        </div>

        <p style={{
          color: "#64748b",
          margin: "0 0 14px",
          fontSize: "13px"
        }}>
          Your order has been successfully placed
        </p>

        {/* Order Details Card */}
        <div style={{
          background: "#f0fdf4",
          border: "2px solid #10b981",
          borderRadius: "12px",
          padding: "14px 16px",
          marginBottom: "14px"
        }}>
          {/* Order Number - prominent but compact */}
          <div style={{ marginBottom: "10px" }}>
            <label style={{ fontSize: "11px", color: "#64748b", fontWeight: "600" }}>
              ORDER NUMBER
            </label>
            <div style={{
              fontSize: "19px",
              fontWeight: "800",
              color: "#10b981",
              marginTop: "2px",
              fontFamily: "monospace",
              letterSpacing: "1px"
            }}>
              #{data.orderNumber}
            </div>
            <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
              {data.orderDate}
            </div>
          </div>

          {/* Order Information Grid - compact 2-3 column layout */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "8px 12px",
            fontSize: "12px",
            borderTop: "1px solid #d1fae5",
            paddingTop: "10px",
            textAlign: "left"
          }}>
            <div>
              <label style={{ color: "#64748b", fontWeight: "600", fontSize: "10px" }}>PATIENT NAME</label>
              <div style={{ marginTop: "2px", fontWeight: "600" }}>{data.patientName}</div>
            </div>
            <div>
              <label style={{ color: "#64748b", fontWeight: "600", fontSize: "10px" }}>PHONE</label>
              <div style={{ marginTop: "2px", fontWeight: "600" }}>{data.patientPhone}</div>
            </div>
            <div>
              <label style={{ color: "#64748b", fontWeight: "600", fontSize: "10px" }}>CITY</label>
              <div style={{ marginTop: "2px", fontWeight: "600" }}>{data.patientLocation || "N/A"}</div>
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ color: "#64748b", fontWeight: "600", fontSize: "10px" }}>DELIVERY ADDRESS</label>
              <div style={{ marginTop: "2px", fontWeight: "600" }}>{data.deliveryAddress || "N/A"}</div>
            </div>

            {data.specialNotes && data.specialNotes.trim() !== "" && (
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ color: "#64748b", fontWeight: "600", fontSize: "10px" }}>SPECIAL NOTES</label>
                <div style={{ marginTop: "2px", fontWeight: "600" }}>{data.specialNotes}</div>
              </div>
            )}

            <div style={{ gridColumn: "1 / -1", borderTop: "1px solid #d1fae5", paddingTop: "8px" }}>
              <label style={{ color: "#64748b", fontWeight: "600", fontSize: "10px" }}>MEDICINE</label>
              <div style={{ marginTop: "2px", fontWeight: "600", color: "#2563eb" }}>
                {data.medicineName} {data.medicineStrength && data.medicineStrength !== "N/A" ? `(${data.medicineStrength})` : ""}
              </div>
            </div>
            <div>
              <label style={{ color: "#64748b", fontWeight: "600", fontSize: "10px" }}>QTY</label>
              <div style={{ marginTop: "2px", fontWeight: "600" }}>{data.quantity || 1}</div>
            </div>
            <div>
              <label style={{ color: "#64748b", fontWeight: "600", fontSize: "10px" }}>CATEGORY</label>
              <div style={{ marginTop: "2px", fontWeight: "600" }}>{data.medicineCategory || "General"}</div>
            </div>
            <div>
              <label style={{ color: "#64748b", fontWeight: "600", fontSize: "10px" }}>TOTAL</label>
              <div style={{ marginTop: "2px", fontWeight: "700", color: "#ef4444" }}>
                Rs. {data.totalPrice}
              </div>
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ color: "#64748b", fontWeight: "600", fontSize: "10px" }}>PHARMACY</label>
              <div style={{ marginTop: "2px", fontWeight: "600" }}>{data.pharmacyName}</div>
            </div>
          </div>
        </div>

        {/* Info Message - compact, combined with email confirmation */}
        <div style={{
          background: "#eff6ff",
          border: "1px solid #e0f2fe",
          borderRadius: "8px",
          padding: "10px 12px",
          fontSize: "11.5px",
          color: "#0c4a6e",
          lineHeight: "1.5",
          marginBottom: "14px",
          textAlign: "left"
        }}>
          <strong>📋 Next Steps:</strong> Pharmacy will review and contact you within 2-4 hours.
          <br/>✓ Confirmation sent to <strong>{data.patientEmail}</strong>
        </div>

        {/* Action Buttons */}
        <div className="no-print" style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => window.print()}
            style={{
              flex: 1,
              padding: "11px 16px",
              background: "#fff",
              color: "#0f172a",
              border: "2px solid #cbd5e1",
              borderRadius: "8px",
              fontWeight: "700",
              fontSize: "13px",
              cursor: "pointer",
              transition: "background 0.2s"
            }}
            onMouseEnter={e => e.target.style.background = "#f1f5f9"}
            onMouseLeave={e => e.target.style.background = "#fff"}
          >
            🖨️ Print / Save as PDF
          </button>

          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "11px 16px",
              background: "#10b981",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontWeight: "700",
              fontSize: "13px",
              cursor: "pointer",
              transition: "background 0.2s"
            }}
            onMouseEnter={e => e.target.style.background = "#059669"}
            onMouseLeave={e => e.target.style.background = "#10b981"}
          >
            Back to Search
          </button>
        </div>
      </div>
    </div>
  );
};

  const handleSearch = async (val) => {
    if (!val || val.trim().length < 2) { 
      setResults([]); 
      setLoading(false);
      return; 
    }

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/search?q=${encodeURIComponent(val)}`);
      const resultJson = await response.json();
      
      if (resultJson.success && Array.isArray(resultJson.data)) {
        const uniqueData = resultJson.data.filter((item, index, self) =>
          index === self.findIndex((t) => (
            t.name === item.name && t.pharmacyName === item.pharmacyName
          ))
        );
        setResults(uniqueData);
      } else {
        setResults([]);
      }
    } catch (err) {
      console.error("Connection Error:", err);
      setResults([]); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const delay = setTimeout(() => handleSearch(query), 400);
    return () => clearTimeout(delay);
  }, [query]);

  return (
    <div className={styles.appContainer}>
      <header className={styles.mainHeader}>
        <div className={styles.headerInner}>
          <div className={styles.brand}>
            <Pill className={styles.brandIcon} size={28} />
            <div className={styles.brandText}>
              <h1>MedDetector</h1>
              <span>Professional Search</span>
            </div>
          </div>
        </div>
      </header>

      <main className={styles.contentArea}>
        <section className={styles.searchSection}>
          <h2>Search Medications</h2>
          <p className={styles.subtitle}>Locate availability across verified pharmacies</p>
          <div className={styles.searchBoxWrapper}>
            <div className={styles.searchInputGroup}>
              <SearchIcon className={styles.prefixIcon} size={20} />
              <input 
                type="text" 
                className={styles.professionalInput}
                placeholder="Search medicine name (e.g. Panadol)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
        </section>

        <section className={styles.resultsGrid}>
          {loading ? (
            <div className={styles.loadingState}><Loader2 className="animate-spin" /> Searching...</div>
          ) : (results && results.length > 0) ? (
            results.map((med) => {
              const isOutOfStock = med.stock <= 0 || med.quantity <= 0 || med.status === 'Short';

              const isHighlighted = highlightedMed && med.name.toLowerCase().includes(highlightedMed.toLowerCase());

              return (
                <div
                  key={med._id}
                  id={`med-${med.name}`}
                  ref={el => { if (el) cardRefs.current[med.name] = el; }}
                  className={styles.medicationCard}
                  style={isHighlighted ? {
                    outline: '2.5px solid #3b82f6',
                    boxShadow: '0 0 0 6px rgba(59,130,246,0.15)',
                    transition: 'all 0.3s ease',
                  } : {}}
                >
                  <div className={styles.cardHeader}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span className={styles.badgePharmacy}>
                        {typeof med.pharmacyName === 'object' ? med.pharmacyName.name : med.pharmacyName}
                      </span>
                      
                      <span style={{ 
                        backgroundColor: isOutOfStock ? '#fee2e2' : '#dcfce7', 
                        color: isOutOfStock ? '#dc2626' : '#16a34a',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        border: `1px solid ${isOutOfStock ? '#fca5a5' : '#86efac'}`,
                        textTransform: 'uppercase'
                      }}>
                        {isOutOfStock ? 'Out of Stock' : 'Available'}
                      </span>
                    </div>
                    <h3>{med.name}</h3>
                    <div className={styles.specRow}>
                      <span className={styles.specTag}>{med.strength || 'N/A'}</span>
                      <span className={styles.specTag}>{med.category || 'General'}</span>
                    </div>
                  </div>

                  <div className={styles.cardBody}>
                    <div className={styles.infoItem}>
                     <MapPin size={14} /> 
                     {[med.address, med.location].filter(Boolean).join(", ") || "Location not available"}
                    </div>
                    <div className={styles.priceContainer}>
                      <span className={styles.priceLabel}>Estimated Price:</span>
                      <span className={styles.priceValue}>Rs. {med.price}</span>
                    </div>
                  </div>

                  <div className={styles.cardActions}>
                    <a href={`tel:${med.pharmacyPhone || "03001234567"}`} className={styles.btnCall}>
                      <Phone size={16} /> Call
                    </a>
                    <button 
                      onClick={() => { 
                        setSelectedMed(med); 
                        setShowModal(true); 
                        setPrescriptionUrl('');
                      }} 
                      className={styles.btnInfo}
                      disabled={isOutOfStock}
                      style={{ opacity: isOutOfStock ? 0.5 : 1, cursor: isOutOfStock ? 'not-allowed' : 'pointer' }}
                    >
                      <Info size={16} /> Details
                    </button>
                    <button 
                      className={styles.btnAlt} 
                      onClick={() => { 
                        setSelectedMedName(med.name); 
                        setSelectedGenericName(med.genericName); 
                        setShowAltModal(true); 
                      }}
                    >
                      <Info size={16} /> Alt
                    </button>
                  </div>
                </div>
              );
            })
          ) : query.length > 1 && !loading ? (
            <div className={styles.noResultsMsg}>
              <ShieldCheck size={48} color="#94a3b8" />
              <p>No verified records found for "{query}".</p>
            </div>
          ) : null}
        </section>
      </main>

      {showModal && selectedMed && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <button className={styles.closeBtnRound} onClick={() => {
              setShowModal(false);
              setPrescriptionUrl('');
            }}>
              <X size={20} />
            </button>
            <h3>{typeof selectedMed.pharmacyName === 'object' ? selectedMed.pharmacyName.name : selectedMed.pharmacyName}</h3>
            <div className={styles.contactInfo}>
              <div className={styles.infoItemBoxed}><Mail size={16} /> my.meddetector@gmail.com</div>
              <div className={styles.infoItemBoxed}><Clock size={16} /> 09:00 AM - 11:00 PM</div>
            </div>
            <div className={styles.verificationBox}>
              <ShieldCheck size={20} color="#f97316" />
              <h4>Verification Required</h4>
              <p>Please upload prescription to continue with the order.</p>
              
              <label className={styles.uploadLabel}>
                {uploading ? (
                  <><Loader2 className="animate-spin" size={18} /> Uploading... {uploadProgress}%</>
                ) : prescriptionUrl ? (
                  <><ShieldCheck size={18} /> Uploaded ✓</>
                ) : (
                  <><Upload size={18} /> Upload Image</>
                )}
                <input 
                  type="file" 
                  style={{display: 'none'}} 
                  onChange={handleUpload}
                  accept="image/*" 
                  disabled={uploading || prescriptionUrl}
                />
              </label>

              {uploading && (
                <div className={styles.progressBarTrack}>
                  <div
                    className={styles.progressBarFill}
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}

          
<button 
  className={styles.confirmBtn}
  disabled={!prescriptionUrl || orderProcessing}
  onClick={() => setShowOrderForm(true)}  // ⭐ OPENS FORM MODAL
  style={{
    opacity: (!prescriptionUrl || orderProcessing) ? 0.6 : 1,
    cursor: (!prescriptionUrl || orderProcessing) ? 'not-allowed' : 'pointer'
  }}
>
  {orderProcessing ? (
    <><Loader2 className="animate-spin" size={16} /> Processing...</>
  ) : prescriptionUrl ? (
    "Confirm Order"
  ) : (
    "Please Upload Prescription"
  )}
</button>
            </div>
          </div>
        </div>
      )}

       {showAltModal && (
        <Alternative
          medName={selectedMedName}
          genericName={selectedGenericName}
          onClose={() => setShowAltModal(false)}
          onSelectAlternative={(altName) => {
            setQuery(altName);
            setHighlightedMed(altName);
            // Scroll after results load
            setTimeout(() => {
              const keys = Object.keys(cardRefs.current);
              const matchKey = keys.find(k => k.toLowerCase().includes(altName.toLowerCase()));
              if (matchKey && cardRefs.current[matchKey]) {
                cardRefs.current[matchKey].scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
              setTimeout(() => setHighlightedMed(null), 2500);
            }, 900);
          }}
        />
      )}

      {showOrderForm && (
        <OrderFormModal
          medicine={selectedMed}
          prescriptionUrl={prescriptionUrl}
          onSubmit={handleConfirmOrder}
          onClose={() => setShowOrderForm(false)}
        />
      )}

      {showConfirmation && (
        <OrderConfirmationModal
          data={orderConfirmation}
          onClose={() => {
            setShowConfirmation(false);
            setPrescriptionUrl('');
            setSelectedMed(null);
          }}
        />
      )}

      
    </div>
    
  );
   


};

export default SearchComponent;