import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import "../PortalStyles.css";
import { addMedicine } from "../../api";

const AddMedicine = () => {
  const [form, setForm] = useState({
    name:"", company:"", price:"", stock:"", expiry:"", category:"", description:""
  });
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false); // Loading state for UX

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
const handleSubmit = async () => {
  if (!form.name.trim()) { alert("Please enter a medicine name"); return; }
  if (!form.stock)       { alert("Please enter stock quantity");  return; }

  setLoading(true);
  try {
    const response = await addMedicine({
      ...form,
      price: parseFloat(form.price) || 0,
      stock: parseInt(form.stock) || 0,
    });

    if (response.data && response.data.success) {
      setSuccess(true);
      setForm({ name:"", company:"", price:"", stock:"", expiry:"", category:"", description:"" });
      setTimeout(() => setSuccess(false), 3000);
    } else {
      alert("Server Error: " + response.data.message);
    }
  } catch (error) {
    console.error("Submission failed:", error);
    alert("Could not connect to server. Check authorization token.");
  } finally {
    setLoading(false);
  }
};


  return (
    <div style={{ display:"flex" }}>
      <Sidebar />
      <div className="main-content">
        <Navbar />
        <div className="page-content">
          <div className="page-header">
            <div>
              <h1>Add Medicine</h1>
              <p>Add a new medicine to your inventory</p>
            </div>
          </div>

          {success && (
            <div style={{ background: "var(--green-light)", border: "1px solid var(--green)", borderRadius: "var(--radius)", padding: "14px 20px", display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px", color: "var(--green)", fontWeight: "600" }}>
              ✅ Medicine added successfully to MongoDB Atlas!
            </div>
          )}

          <div className="card">
            <div className="card-header">
              <div className="card-title">💊 Medicine Details</div>
              <span style={{ fontSize:"13px", color:"var(--text-muted)" }}>Fields marked * are required</span>
            </div>
            <div className="card-body">
              <div className="form-grid" style={{ marginBottom:"16px" }}>
                <div className="form-group">
                  <label>Medicine Name *</label>
                  <input name="name" placeholder="e.g. Panadol" value={form.name} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Company / Brand</label>
                  <input name="company" placeholder="e.g. GSK" value={form.company} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Price (Rs)</label>
                  <input name="price" type="number" placeholder="0" value={form.price} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Stock Quantity *</label>
                  <input name="stock" type="number" placeholder="0" value={form.stock} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Expiry Date</label>
                  <input name="expiry" type="date" value={form.expiry} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select name="category" value={form.category} onChange={handleChange}>
                    <option value="">Select category</option>
                    <option value="Antibiotic">Antibiotic</option>
                    <option value="Painkiller">Painkiller</option>
                    <option value="Vitamin">Vitamin / Supplement</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom:"20px" }}>
                <label>Description / Notes</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={3} style={{ padding: "10px 14px", border: "1px solid var(--border)", borderRadius: "9px", fontSize: "14px", color: "var(--text)", background: "var(--card)", outline: "none", width: "100%" }} />
              </div>

              <div style={{ display:"flex", gap:"10px" }}>
                <button className="btn btn-gold" onClick={handleSubmit} disabled={loading}>
                  {loading ? "⏳ Processing..." : "💾 Add to Inventory"}
                </button>
                <button className="btn btn-outline" onClick={() => setForm({ name:"", company:"", price:"", stock:"", expiry:"", category:"", description:"" })}>
                  🔄 Clear Form
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMedicine;