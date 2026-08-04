import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

// ─────────────────────────────────────────────────────────────────────────
// ✅ FIXED: This page now reads from the SAME backend orders collection as
// Prescriptions.jsx (GET /api/orders?pharmacy=...), scoped to the logged-in
// pharmacy. Only orders whose prescription has been "Approved" show up here
// — once a pharmacy approves a prescription on the Prescriptions page, the
// order automatically appears in this Requests list for fulfillment
// (Pending -> Accepted -> Ready -> Delivered), tracked via deliveryStatus.
// ─────────────────────────────────────────────────────────────────────────

const Requests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [updating, setUpdating] = useState(null);

  // --- Manual Add Form State ---
  const [form, setForm] = useState({
    customerName: "", email: "", phone: "", location: "",
    medicineName: "", qty: 1, notes: "", deliveryAddress: ""
  });

  // --- Validation Logic ---
  const isEmailValid = (email) => !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPhoneValid = (phone) => !phone || /^\d{10,11}$/.test(phone);

  // ✅ Fetch real orders for this pharmacy, scoped to status === "Approved"
  // (i.e. prescription already verified on the Prescriptions page).
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const userObj      = JSON.parse(localStorage.getItem("user")) || {};
      const pharmacyName = userObj.pharmacyName || userObj.name;

      if (!pharmacyName) { setRequests([]); return; }

      const res  = await fetch(
        `http://localhost:5000/api/orders?pharmacy=${encodeURIComponent(pharmacyName)}`,
        { headers: { "Content-Type": "application/json" } }
      );
      const data = await res.json();

      if (data.success && Array.isArray(data.data)) {
        // ✅ Only show orders whose prescription has been Approved —
        // Pending/Rejected prescriptions stay on the Prescriptions page
        // until the pharmacy makes a decision.
        const approvedOnly = data.data.filter(o => o.status === "Approved");
        setRequests(approvedOnly);
      } else {
        setRequests([]);
      }
    } catch (err) {
      console.error("Orders fetch failed:", err.message);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // ✅ Persist deliveryStatus change to the backend (was previously local-state
  // only and lost on refresh). Uses the same PATCH /api/orders/:id endpoint,
  // but sends deliveryStatus instead of status so prescription-verification
  // status is never touched from this page.
  const handleStatusChange = async (id, newDeliveryStatus) => {
    setUpdating(id);
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliveryStatus: newDeliveryStatus })
      });
      const data = await res.json();
      if (data.success) {
        setRequests(prev => prev.map(req =>
          req._id === id ? { ...req, deliveryStatus: newDeliveryStatus } : req
        ));
      } else {
        alert("❌ Failed to update status: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      alert("❌ Network error: " + err.message);
    } finally {
      setUpdating(null);
    }
  };

  // ✅ Manual orders are saved to the real backend (isManualEntry: true skips
  // the prescription requirement and goes straight to status: "Approved",
  // deliveryStatus: "Pending" — i.e. it appears here immediately).
  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!isEmailValid(form.email) || !isPhoneValid(form.phone)) {
      alert("Please fix the errors in red fields first! ❌");
      return;
    }

    try {
      const userObj      = JSON.parse(localStorage.getItem("user")) || {};
      const pharmacyName = userObj.pharmacyName || userObj.name;

      const res = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientName: form.customerName,
          patientEmail: form.email || "not-provided@manual.entry",
          patientPhone: form.phone || "0000000000",
          patientLocation: form.location || "Lahore",
          pharmacyName: pharmacyName,
          medicineName: form.medicineName,
          quantity: form.qty,
          deliveryAddress: form.deliveryAddress || form.location || "Walk-in / Manual order",
          specialNotes: form.notes,
          isManualEntry: true // ✅ skips prescription requirement
        })
      });
      const data = await res.json();

      if (data.success) {
        alert(`✅ Manual order ${data.orderNumber} added successfully!`);
        setShowForm(false);
        setForm({ customerName: "", email: "", phone: "", location: "", medicineName: "", qty: 1, notes: "", deliveryAddress: "" });
        fetchOrders(); // refresh list from backend
      } else {
        alert("❌ Failed to save order: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      alert("❌ Network error: " + err.message);
    }
  };

  // ✅ Delete persists to backend too (was local-only before).
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this order permanently?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setRequests(prev => prev.filter(i => i._id !== id));
      } else {
        alert("❌ Failed to delete: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      alert("❌ Network error: " + err.message);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f4f7fe", width: "100%" }}>
      <Sidebar />
      <div className="main-content" style={{ flex: 1, marginLeft: "var(--sidebar-w)", maxWidth: "calc(100vw - var(--sidebar-w))", overflowX: "hidden" }}>
        <Navbar />
        <div className="page-content" style={{ padding: "20px" }}>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", flexWrap: "wrap", gap: "10px" }}>
            <h1 style={{ fontSize: "22px", fontWeight: "800", color: "#2b3674" }}>Patient Orders (Requests)</h1>
            <button onClick={() => setShowForm(!showForm)} className="btn btn-gold">{showForm ? "✕ Close" : "+ Add Manual Order"}</button>
          </div>

          <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "20px" }}>
            ℹ️ Only orders with an <strong>approved</strong> prescription appear here. Approve prescriptions from the{" "}
            <a href="/pharmacy/prescriptions" style={{ color: "#2563eb", fontWeight: "600" }}>Prescriptions</a> page first.
          </p>

          {/* --- Manual Add Form with Red Validation --- */}
          {showForm && (
            <div className="card" style={{ padding: "20px", marginBottom: "25px", borderRadius: "15px", border: "1px solid var(--gold)" }}>
              <form onSubmit={handleManualSubmit} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "15px" }}>
                <input placeholder="Customer Name" value={form.customerName} onChange={e => setForm({...form, customerName: e.target.value})} required />

                {/* Email with Red Border Validation */}
                <input
                  placeholder="Email Address"
                  type="email"
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                  style={{ border: !isEmailValid(form.email) ? "2px solid #ef4444" : "1px solid #ddd" }}
                />

                {/* Phone with Red Border Validation */}
                <input
                  placeholder="Phone (e.g. 03001234567)"
                  value={form.phone}
                  onChange={e => setForm({...form, phone: e.target.value})}
                  style={{ border: !isPhoneValid(form.phone) ? "2px solid #ef4444" : "1px solid #ddd" }}
                />

                <input placeholder="Location" value={form.location} onChange={e => setForm({...form, location: e.target.value})} required />
                <input placeholder="Medicine Name" value={form.medicineName} onChange={e => setForm({...form, medicineName: e.target.value})} required />
                <input placeholder="Quantity" type="number" value={form.qty} onChange={e => setForm({...form, qty: e.target.value})} required />
                <input placeholder="Delivery Address" value={form.deliveryAddress} onChange={e => setForm({...form, deliveryAddress: e.target.value})} />
                <input placeholder="Special Notes" style={{ gridColumn: "1 / -1" }} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />

                <button type="submit" className="btn btn-gold" style={{ gridColumn: "1 / -1" }}>Save Order</button>
              </form>
            </div>
          )}

          {/* --- Table with All Columns --- */}
          <div className="card" style={{ background: "white", borderRadius: "15px", padding: "15px", boxShadow: "0px 10px 30px rgba(0,0,0,0.05)", overflowX: "auto" }}>
            <table style={{ width: "100%", minWidth: "1100px", borderCollapse: "separate", borderSpacing: "0 10px" }}>
              <thead>
                <tr style={{ color: "#a3aed0", fontSize: "12px", textAlign: "left" }}>
                  <th>#</th><th>Customer</th><th>Email</th><th>Phone</th><th>Location</th><th>Medicine</th><th>Qty</th><th>Order Date</th><th>Delivery Status</th><th>Update</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="11" style={{ textAlign: "center", padding: "30px", color: "#94a3b8" }}>Loading orders...</td></tr>
                ) : requests.length === 0 ? (
                  <tr><td colSpan="11" style={{ textAlign: "center", padding: "30px", color: "#94a3b8" }}>No approved orders yet. Approve a prescription to see it here.</td></tr>
                ) : requests.map((item, index) => (
                  <tr key={item._id || index} style={{ background: "#fff", fontSize: "13px" }}>
                    <td style={{ padding: "15px" }}>{index + 1}</td>
                    <td style={{ fontWeight: "700" }}>{item.patientName || "Guest"}</td>
                    <td>{item.patientEmail || "—"}</td>
                    <td>{item.patientPhone || "—"}</td>
                    <td>{item.patientLocation || item.deliveryAddress || "—"}</td>
                    <td style={{ color: "#422afb", fontWeight: "600" }}>{item.medicineName}</td>
                    <td>{item.quantity || 1}</td>
                    <td>{item.orderDate ? new Date(item.orderDate).toLocaleDateString() : "—"}</td>
                    <td>
                      <span style={{
                        padding: "5px 10px", borderRadius: "10px", fontSize: "11px", fontWeight: "700",
                        background: item.deliveryStatus === "Delivered" ? "#e6fffb" : item.deliveryStatus === "Ready" ? "#e6f7ff" : item.deliveryStatus === "Accepted" ? "#f0f9ff" : "#fff7e6",
                        color: item.deliveryStatus === "Delivered" ? "#08979c" : item.deliveryStatus === "Ready" ? "#1890ff" : item.deliveryStatus === "Accepted" ? "#0369a1" : "#d46b08"
                      }}>
                        {item.deliveryStatus || "Pending"}
                      </span>
                    </td>
                    <td>
                      <select
                        value={item.deliveryStatus || "Pending"}
                        disabled={updating === item._id}
                        onChange={(e) => handleStatusChange(item._id, e.target.value)}
                        style={{ padding: "5px", borderRadius: "8px", border: "1px solid #eee" }}
                      >
                        <option value="Pending">⌛ Pending</option>
                        <option value="Accepted">✅ Accepted</option>
                        <option value="Ready">📦 Ready</option>
                        <option value="Delivered">🚚 Delivered</option>
                      </select>
                    </td>
                    <td><button onClick={() => handleDelete(item._id)} style={{ border: "none", background: "none", cursor: "pointer" }}>🗑️</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Requests;