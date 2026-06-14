import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { getRequests } from "../../api"; // File ke upar yeh import add karein

const Requests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // --- Form State ---
  const [form, setForm] = useState({
    customerName: "", email: "", phone: "", location: "",
    medicineName: "", qty: 1, date: new Date().toISOString().split('T')[0], notes: ""
  });

  // --- Validation Logic ---
  const isEmailValid = (email) => !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPhoneValid = (phone) => !phone || /^\d{10,11}$/.test(phone);

  const fetchOrders = useCallback(async () => {
  try {
    setLoading(true);
    // Humne centralized API call use ki jo header mein token khud le jayegi
    const res = await getRequests(); 
    
    // Axios response mein data directly res.data mein hota hai ya res.data.data mein (as per backend)
    if (res.data && res.data.success) { 
      setRequests(res.data.data || []); 
    } else if (res.success) {
      setRequests(res.data || []);
    }
  } catch (err) { 
    console.error("Orders fetch failed:", err.message); 
  } finally { 
    setLoading(false); 
  }
}, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleStatusChange = (id, newStatus) => {
    setRequests(prev => prev.map(req => req._id === id ? { ...req, status: newStatus } : req));
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!isEmailValid(form.email) || !isPhoneValid(form.phone)) {
      alert("Please fix the errors in red fields first! ❌");
      return;
    }
    const newEntry = { ...form, _id: Date.now(), status: "Pending" };
    setRequests([newEntry, ...requests]);
    setShowForm(false);
    setForm({ customerName: "", email: "", phone: "", location: "", medicineName: "", qty: 1, date: new Date().toISOString().split('T')[0], notes: "" });
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f4f7fe", width: "100%" }}>
      <Sidebar />
      <div className="main-content" style={{ flex: 1, marginLeft: "var(--sidebar-w)", maxWidth: "calc(100vw - var(--sidebar-w))", overflowX: "hidden" }}>
        <Navbar />
        <div className="page-content" style={{ padding: "20px" }}>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px", flexWrap: "wrap", gap: "10px" }}>
            <h1 style={{ fontSize: "22px", fontWeight: "800", color: "#2b3674" }}>Patient Orders (Requests)</h1>
            <button onClick={() => setShowForm(!showForm)} className="btn btn-gold">{showForm ? "✕ Close" : "+ Add Manual Order"}</button>
          </div>

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
                <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required />
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
                  <th>#</th><th>Customer</th><th>Email</th><th>Phone</th><th>Location</th><th>Medicine</th><th>Qty</th><th>Date</th><th>Status</th><th>Update</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((item, index) => (
                  <tr key={item._id || index} style={{ background: "#fff", fontSize: "13px" }}>
                    <td style={{ padding: "15px" }}>{index + 1}</td>
                    <td style={{ fontWeight: "700" }}>{item.customerName || "Guest"}</td>
                    <td>{item.email || "—"}</td>
                    <td>{item.phone || "—"}</td>
<td>{typeof item.location === 'object' ? "Lahore" : item.location || "Lahore"}</td>
                    <td style={{ color: "#422afb", fontWeight: "600" }}>{item.medicineName || item.name}</td>
                    <td>{item.qty || 1}</td>
                    <td>{item.date || "Today"}</td>
                    <td>
                      <span style={{ 
                        padding: "5px 10px", borderRadius: "10px", fontSize: "11px", fontWeight: "700",
                        background: item.status === "Delivered" ? "#e6fffb" : item.status === "Ready" ? "#e6f7ff" : "#fff7e6",
                        color: item.status === "Delivered" ? "#08979c" : item.status === "Ready" ? "#1890ff" : "#d46b08"
                      }}>
                        {item.status || "Pending"}
                      </span>
                    </td>
                    <td>
                      <select value={item.status || "Pending"} onChange={(e) => handleStatusChange(item._id, e.target.value)} style={{ padding: "5px", borderRadius: "8px", border: "1px solid #eee" }}>
                        <option value="Pending">⌛ Pending</option>
                        <option value="Accepted">✅ Accepted</option>
                        <option value="Ready">📦 Ready</option>
                        <option value="Delivered">🚚 Delivered</option>
                      </select>
                    </td>
                    <td><button onClick={() => setRequests(r => r.filter(i => i._id !== item._id))} style={{ border: "none", background: "none" }}>🗑️</button></td>
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