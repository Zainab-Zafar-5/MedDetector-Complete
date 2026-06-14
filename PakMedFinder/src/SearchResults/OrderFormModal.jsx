import React, { useState } from "react";
import { X, User, Mail, Phone, MapPin, Pill } from "lucide-react";

const OrderFormModal = ({ medicine, prescriptionUrl, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    patientName: "",
    patientEmail: "",
    patientPhone: "",
    patientLocation: "Lahore",
    deliveryAddress: "",
    specialNotes: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.patientName.trim()) {
      setError("❌ Please enter your full name");
      return false;
    }
    if (!formData.patientEmail.trim() || !formData.patientEmail.includes("@")) {
      setError("❌ Please enter a valid email");
      return false;
    }
    if (!formData.patientPhone.trim() || formData.patientPhone.length < 10) {
      setError("❌ Please enter a valid phone number");
      return false;
    }
    if (!formData.deliveryAddress.trim()) {
      setError("❌ Please enter delivery address");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      await onSubmit(formData);
    } catch (err) {
      setError("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  };

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
      zIndex: 99999,
      padding: "20px",
      overflow: "auto"
    }}>
      <div style={{
        background: "white",
        borderRadius: "16px",
        maxWidth: "600px",
        width: "100%",
        maxHeight: "95vh",
        position: "relative",
        margin: "auto",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden"
      }}>
        {/* STICKY HEADER */}
        <div style={{
          position: "sticky",
          top: 0,
          background: "white",
          padding: "30px 40px 20px",
          borderBottom: "1px solid #e5e7eb",
          zIndex: 100000,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start"
        }}>
          <div style={{ flex: 1 }}>
            <h2 style={{
              fontSize: "28px",
              fontWeight: "800",
              margin: "0 0 8px",
              color: "#0f172a"
            }}>
              📋 Confirm Your Order
            </h2>
            <p style={{
              color: "#64748b",
              margin: 0,
              fontSize: "14px"
            }}>
              Please provide your details to place the order
            </p>
          </div>
          {/* CLOSE BUTTON - Always visible */}
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#666",
              padding: "0 0 0 20px",
              fontSize: "28px",
              marginTop: "0"
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* SCROLLABLE FORM CONTENT */}
        <div style={{
          padding: "30px 40px",
          overflowY: "auto",
          flex: 1
        }}>
          {/* Medicine Summary Card */}
          <div style={{
            background: "#f0f9ff",
            border: "1px solid #e0f2fe",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "30px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
              <Pill size={20} style={{ color: "#2563eb" }} />
              <h3 style={{ margin: 0, color: "#0f172a" }}>{medicine.name}</h3>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", fontSize: "13px" }}>
              <div>
                <label style={{ color: "#64748b", fontWeight: "600" }}>Strength</label>
                <div style={{ marginTop: "4px", fontWeight: "600" }}>{medicine.strength || "N/A"}</div>
              </div>
              <div>
                <label style={{ color: "#64748b", fontWeight: "600" }}>Price</label>
                <div style={{ marginTop: "4px", fontWeight: "600", color: "#10b981" }}>Rs. {medicine.price}</div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "8px",
              padding: "12px 16px",
              marginBottom: "20px",
              color: "#dc2626",
              fontSize: "14px",
              fontWeight: "600"
            }}>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "20px" }}>
              <label style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "14px",
                fontWeight: "600",
                color: "#0f172a",
                marginBottom: "8px"
              }}>
                <User size={16} /> Full Name *
              </label>
              <input
                type="text"
                name="patientName"
                placeholder="Enter your full name"
                value={formData.patientName}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box"
                }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "14px",
                fontWeight: "600",
                color: "#0f172a",
                marginBottom: "8px"
              }}>
                <Mail size={16} /> Email Address *
              </label>
              <input
                type="email"
                name="patientEmail"
                placeholder="your.email@example.com"
                value={formData.patientEmail}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box"
                }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "14px",
                fontWeight: "600",
                color: "#0f172a",
                marginBottom: "8px"
              }}>
                <Phone size={16} /> Phone Number *
              </label>
              <input
                type="tel"
                name="patientPhone"
                placeholder="03001234567"
                value={formData.patientPhone}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box"
                }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "14px",
                fontWeight: "600",
                color: "#0f172a",
                marginBottom: "8px"
              }}>
                <MapPin size={16} /> City/Location
              </label>
              <input
                type="text"
                name="patientLocation"
                placeholder="e.g., Lahore, Karachi"
                value={formData.patientLocation}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box"
                }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "14px",
                fontWeight: "600",
                color: "#0f172a",
                marginBottom: "8px"
              }}>
                <MapPin size={16} /> Delivery Address *
              </label>
              <textarea
                name="deliveryAddress"
                placeholder="House/Building number, Street, Area"
                value={formData.deliveryAddress}
                onChange={handleChange}
                rows="3"
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                  resize: "none"
                }}
              />
            </div>

            <div style={{ marginBottom: "30px" }}>
              <label style={{
                fontSize: "14px",
                fontWeight: "600",
                color: "#0f172a",
                marginBottom: "8px",
                display: "block"
              }}>
                📝 Special Notes (Optional)
              </label>
              <textarea
                name="specialNotes"
                placeholder="Any special instructions or notes for the pharmacy"
                value={formData.specialNotes}
                onChange={handleChange}
                rows="2"
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                  resize: "none"
                }}
              />
            </div>

            {/* Buttons */}
            <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  flex: 1,
                  padding: "14px 20px",
                  background: loading ? "rgba(37, 99, 235, 0.6)" : "#2563eb",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: "700",
                  fontSize: "15px",
                  cursor: loading ? "not-allowed" : "pointer"
                }}
              >
                {loading ? "⏳ Processing..." : "✅ Confirm Order"}
              </button>
              <button
                type="button"
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: "14px 20px",
                  background: "#e5e7eb",
                  color: "#333",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: "700",
                  fontSize: "15px",
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>
            </div>

            {prescriptionUrl && (
              <div style={{
                paddingTop: "20px",
                borderTop: "1px solid #e5e7eb",
                fontSize: "13px",
                color: "#10b981"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{
                    width: "20px",
                    height: "20px",
                    background: "#10b981",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: "12px",
                    fontWeight: "700"
                  }}>
                    ✓
                  </span>
                  Prescription uploaded successfully
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default OrderFormModal;
