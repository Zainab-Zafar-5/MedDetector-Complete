import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import "../PortalStyles.css";
import { Eye, Download, CheckCircle, X, Loader2 } from "lucide-react";

// ── IMAGE MODAL ──────────────────────────────────────────────────────────────
const ImageModal = ({ image, onClose }) => {
  if (!image) return null;
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.7)", display: "flex",
      alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "20px"
    }}>
      <div style={{
        background: "white", borderRadius: "16px", padding: "30px",
        maxWidth: "600px", width: "100%", position: "relative"
      }}>
        <button onClick={onClose} style={{
          position: "absolute", top: "15px", right: "15px",
          background: "none", border: "none", cursor: "pointer", fontSize: "20px"
        }}>
          <X size={24} />
        </button>
        <h2 style={{ marginTop: 0, marginBottom: "20px" }}>📋 Prescription Image</h2>
        <img src={image} alt="Prescription" style={{
          width: "100%", maxHeight: "400px", objectFit: "contain",
          borderRadius: "12px", marginBottom: "20px", border: "1px solid #e0e0e0"
        }} />
        <div style={{ display: "flex", gap: "10px" }}>
          <a href={image} download style={{
            flex: 1, padding: "12px", background: "#2563eb", color: "white",
            textAlign: "center", borderRadius: "8px", textDecoration: "none", fontWeight: "600"
          }}>
            <Download size={16} style={{ display: "inline", marginRight: "5px" }} /> Download
          </a>
          <button onClick={onClose} style={{
            flex: 1, padding: "12px", background: "#e5e7eb",
            border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer"
          }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ── DETAILS MODAL ────────────────────────────────────────────────────────────
const DetailsModal = ({ order, onClose, onApprove, approving, onViewPrescription }) => {
  if (!order) return null;
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.7)", display: "flex",
      alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "20px"
    }}>
      <div style={{
        background: "white", borderRadius: "16px", padding: "40px",
        maxWidth: "600px", width: "100%", maxHeight: "90vh",
        overflowY: "auto", position: "relative"
      }}>
        <button onClick={onClose} style={{
          position: "absolute", top: "20px", right: "20px",
          background: "none", border: "none", cursor: "pointer"
        }}>
          <X size={24} />
        </button>

        <h2 style={{ marginTop: 0, marginBottom: "20px", fontSize: "24px", fontWeight: "800" }}>
          📋 Order Details
        </h2>

        {/* Order Number */}
        <div style={{ marginBottom: "25px", paddingBottom: "20px", borderBottom: "2px solid #e0e0e0" }}>
          <label style={{ fontSize: "12px", color: "#999", fontWeight: "600", textTransform: "uppercase" }}>Order Number</label>
          <div style={{ fontSize: "20px", fontWeight: "700", color: "#2563eb", marginTop: "8px" }}>
            #{order.orderNumber || "N/A"}
          </div>
        </div>

        {/* Patient Information */}
        <div style={{ marginBottom: "25px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: "700", color: "#333", marginBottom: "15px" }}>👤 Patient Information</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", fontSize: "14px" }}>
            <div>
              <label style={{ color: "#999", fontWeight: "600" }}>Name</label>
              <div style={{ marginTop: "5px", fontWeight: "600" }}>{order.patientName}</div>
            </div>
            <div>
              <label style={{ color: "#999", fontWeight: "600" }}>Phone</label>
              <div style={{ marginTop: "5px", fontWeight: "600" }}>{order.patientPhone}</div>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ color: "#999", fontWeight: "600" }}>Email</label>
              <div style={{ marginTop: "5px", fontWeight: "600" }}>{order.patientEmail}</div>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ color: "#999", fontWeight: "600" }}>Location</label>
              <div style={{ marginTop: "5px", fontWeight: "600" }}>{order.patientLocation}</div>
            </div>
          </div>
        </div>

        {/* Medicine Details */}
        <div style={{ marginBottom: "25px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: "700", color: "#333", marginBottom: "15px" }}>💊 Medicine Details</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", fontSize: "14px" }}>
            <div>
              <label style={{ color: "#999", fontWeight: "600" }}>Medicine</label>
              <div style={{ marginTop: "5px", fontWeight: "600" }}>{order.medicineName}</div>
            </div>
            <div>
              <label style={{ color: "#999", fontWeight: "600" }}>Strength</label>
              <div style={{ marginTop: "5px", fontWeight: "600" }}>{order.medicineStrength}</div>
            </div>
            <div>
              <label style={{ color: "#999", fontWeight: "600" }}>Category</label>
              <div style={{ marginTop: "5px", fontWeight: "600" }}>{order.medicineCategory}</div>
            </div>
            <div>
              <label style={{ color: "#999", fontWeight: "600" }}>Price</label>
              <div style={{ marginTop: "5px", fontWeight: "700", color: "#10b981" }}>Rs. {order.medicinePrice}</div>
            </div>
          </div>
        </div>

        {/* Order Information */}
        <div style={{ marginBottom: "25px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: "700", color: "#333", marginBottom: "15px" }}>📦 Order Information</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", fontSize: "14px" }}>
            <div>
              <label style={{ color: "#999", fontWeight: "600" }}>Order Date</label>
              <div style={{ marginTop: "5px", fontWeight: "600" }}>{new Date(order.orderDate).toLocaleDateString()}</div>
            </div>
            <div>
              <label style={{ color: "#999", fontWeight: "600" }}>Quantity</label>
              <div style={{ marginTop: "5px", fontWeight: "600" }}>{order.quantity} unit(s)</div>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ color: "#999", fontWeight: "600" }}>Delivery Address</label>
              <div style={{ marginTop: "5px", fontWeight: "600" }}>{order.deliveryAddress}</div>
            </div>
          </div>
        </div>

        {/* Status */}
        <div style={{ marginBottom: "25px" }}>
          <label style={{ fontSize: "12px", color: "#999", fontWeight: "600", textTransform: "uppercase" }}>Current Status</label>
          <div style={{ marginTop: "8px" }}>
            <span style={{
              display: "inline-block", padding: "8px 16px", borderRadius: "6px",
              fontWeight: "600", fontSize: "13px",
              background: order.status === "Approved" ? "#d1fae5" : "#fef3c7",
              color:      order.status === "Approved" ? "#047857"  : "#b45309"
            }}>
              {order.status === "Approved" ? "✅ Approved" : "⏳ Pending Review"}
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            onClick={() => onViewPrescription(order)}
            style={{
              flex: 1, minWidth: "150px", padding: "12px 20px",
              background: "#2563eb", color: "white", border: "none",
              borderRadius: "8px", fontWeight: "600", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px"
            }}
          >
            <Eye size={16} /> View Prescription
          </button>

          {order.status === "Pending" && (
            <button
              onClick={() => onApprove(order._id, order.orderNumber)}
              disabled={approving === order._id}
              style={{
                flex: 1, minWidth: "150px", padding: "12px 20px",
                background: approving === order._id ? "#d1d5db" : "#10b981",
                color: "white", border: "none", borderRadius: "8px",
                fontWeight: "600", cursor: approving === order._id ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px"
              }}
            >
              {approving === order._id
                ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Approving...</>
                : <><CheckCircle size={16} /> Approve Order</>
              }
            </button>
          )}

          <button
            onClick={onClose}
            style={{
              flex: 1, minWidth: "150px", padding: "12px 20px",
              background: "#e5e7eb", color: "#333", border: "none",
              borderRadius: "8px", fontWeight: "600", cursor: "pointer"
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ── MAIN COMPONENT ───────────────────────────────────────────────────────────
const Prescriptions = () => {
  const [orders,           setOrders]           = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [filter,           setFilter]           = useState("all");
  const [selectedImage,    setSelectedImage]    = useState(null);
  const [selectedOrder,    setSelectedOrder]    = useState(null);
  const [showImageModal,   setShowImageModal]   = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [approving,        setApproving]        = useState(null);

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const userObj      = JSON.parse(localStorage.getItem("user")) || {};
        const pharmacyName = userObj.pharmacyName || userObj.name;

        if (!pharmacyName) { setOrders([]); return; }

        const res  = await fetch(
          `http://localhost:5000/api/orders?pharmacy=${encodeURIComponent(pharmacyName)}`,
          { headers: { "Content-Type": "application/json" } }
        );
        const data = await res.json();
        setOrders(data.success && Array.isArray(data.data) ? data.data : []);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(order => {
    if (filter === "pending")  return order.status === "Pending";
    if (filter === "approved") return order.status === "Approved";
    return true;
  });

  const handleApprove = useCallback(async (orderId, orderNumber) => {
    if (!orderId) { alert("❌ Invalid order ID"); return; }
    setApproving(orderId);
    try {
      const res  = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ status: "Approved" })
      });
      const data = await res.json();
      if (data.success) {
        setOrders(prev => prev.map(o =>
          o._id === orderId ? { ...o, status: "Approved", approvedAt: new Date() } : o
        ));
        setSelectedOrder(prev =>
          prev && prev._id === orderId ? { ...prev, status: "Approved", approvedAt: new Date() } : prev
        );
        alert("✅ Prescription approved successfully!");
      } else {
        alert("❌ Error: " + (data.message || "Failed to approve"));
      }
    } catch (err) {
      alert("❌ Network error: " + err.message);
    } finally {
      setApproving(null);
    }
  }, []);

  const handleViewPrescription = useCallback((order) => {
    if (order.prescriptionUrl) {
      window.open(order.prescriptionUrl, "_blank");
    } else {
      alert("❌ No prescription uploaded for this order");
    }
  }, []);

  // ── EXACT SAME LAYOUT AS DASHBOARD ──────────────────────────────────────
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />

      <div className="main-content">
        <Navbar />

        <div className="page-content">

          {/* Header */}
          <div style={{ marginBottom: "30px" }}>
            <h1 style={{ fontSize: "28px", fontWeight: "800", margin: "0 0 6px" }}>
              📋 Patient Prescriptions
            </h1>
            <p style={{ color: "#64748b", margin: 0 }}>
              Manage and verify patient prescription uploads
            </p>
          </div>

          {/* Stats */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
            gap: "20px", marginBottom: "28px"
          }}>
            {[
              { label: "TOTAL",    value: orders.length,                                      color: "#2563eb" },
              { label: "PENDING",  value: orders.filter(o => o.status === "Pending").length,  color: "#f59e0b" },
              { label: "APPROVED", value: orders.filter(o => o.status === "Approved").length, color: "#10b981" },
            ].map((s, i) => (
              <div key={i} className="card" style={{
                background: "white", padding: "22px", borderRadius: "15px", border: "1px solid #eee"
              }}>
                <div style={{ fontSize: "32px", fontWeight: "800", color: s.color }}>{s.value}</div>
                <div style={{ fontSize: "13px", color: "#64748b", fontWeight: "600" }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Filter Tabs */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
            {[
              { value: "all",      label: "All Orders" },
              { value: "pending",  label: "Pending"    },
              { value: "approved", label: "Approved"   },
            ].map(f => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                style={{
                  padding: "9px 20px", borderRadius: "8px", border: "none",
                  fontWeight: "600", cursor: "pointer", fontSize: "13px",
                  background: filter === f.value ? "#2563eb" : "#e5e7eb",
                  color:      filter === f.value ? "white"   : "#333",
                  transition: "all 0.2s"
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Loading */}
          {loading && (
            <div style={{ textAlign: "center", padding: "60px" }}>
              <Loader2 size={40} style={{ animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
              <p style={{ color: "#64748b" }}>Loading prescriptions...</p>
            </div>
          )}

          {/* Table */}
          {!loading && (
            <div className="card" style={{
              background: "white", borderRadius: "15px",
              border: "1px solid #eee", overflow: "auto"
            }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "650px" }}>
                <thead style={{ background: "#f1f5f9" }}>
                  <tr>
                    {["#", "ORDER", "PATIENT", "MEDICINE", "DATE", "STATUS", "ACTION"].map(h => (
                      <th key={h} style={{
                        padding: "14px 16px", textAlign: "left",
                        fontWeight: "600", color: "#64748b",
                        borderBottom: "1px solid #e5e7eb", whiteSpace: "nowrap",
                        fontSize: "12px"
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length > 0 ? filteredOrders.map((order, idx) => (
                    <tr key={order._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "14px 16px", fontWeight: "600", fontSize: "13px" }}>{idx + 1}</td>
                      <td style={{ padding: "14px 16px", fontWeight: "700", color: "#2563eb", whiteSpace: "nowrap", fontSize: "13px" }}>
                        #{order.orderNumber || "N/A"}
                      </td>
                      <td style={{ padding: "14px 16px", fontWeight: "600", fontSize: "13px" }}>{order.patientName}</td>
                      <td style={{ padding: "14px 16px", fontSize: "13px" }}>{order.medicineName}</td>
                      <td style={{ padding: "14px 16px", fontSize: "12px", color: "#64748b", whiteSpace: "nowrap" }}>
                        {new Date(order.orderDate).toLocaleDateString()}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{
                          display: "inline-block", padding: "5px 12px",
                          borderRadius: "6px", fontSize: "12px", fontWeight: "700",
                          whiteSpace: "nowrap",
                          background: order.status === "Approved" ? "#d1fae5" : "#fef3c7",
                          color:      order.status === "Approved" ? "#047857"  : "#92400e"
                        }}>
                          {order.status === "Approved" ? "✅ Approved" : "⏳ Pending"}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <button
                          onClick={() => { setSelectedOrder(order); setShowDetailsModal(true); }}
                          style={{
                            padding: "7px 14px", background: "#2563eb", color: "white",
                            border: "none", borderRadius: "6px", cursor: "pointer",
                            fontSize: "12px", fontWeight: "600",
                            display: "flex", alignItems: "center", gap: "5px"
                          }}
                        >
                          <Eye size={13} /> View
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="7" style={{ padding: "50px", textAlign: "center", color: "#94a3b8", fontSize: "14px" }}>
                        No {filter === "pending" ? "pending" : filter === "approved" ? "approved" : ""} orders found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </div>

      {/* Modals */}
      {showImageModal && (
        <ImageModal image={selectedImage} onClose={() => setShowImageModal(false)} />
      )}
      {showDetailsModal && (
        <DetailsModal
          order={selectedOrder}
          onClose={() => { setShowDetailsModal(false); setSelectedOrder(null); }}
          onApprove={handleApprove}
          approving={approving}
          onViewPrescription={handleViewPrescription}
        />
      )}
    </div>
  );
};

export default Prescriptions;
