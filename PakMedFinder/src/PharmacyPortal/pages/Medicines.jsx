import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import "../../App.css"; 

const Medicines = () => {
  // --- 1. CORE COMPONENT STATES ---
  const [medicines,   setMedicines]   = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages,  setTotalPages]  = useState(1);
  const [totalItems,  setTotalItems]  = useState(0);
  
  // UI Control States
  const [showForm,    setShowForm]    = useState(false);
  const [editingId,   setEditingId]   = useState(null);
  
  // Clean Form Payload Schema
  const [form,        setForm]        = useState({ 
    name: "", price: "", stock: "", company: "",
    genericName: "", strength: "", batchNumber: "", expiryDate: "" 
  });

  // --- 2. FETCH DATA PIPELINE (DYNAMIC ISOLATION CONTROL) ---
  const fetchPage = useCallback(async (page) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("pharmacyToken");
      
      const response = await fetch(`http://localhost:5000/api/medicines?page=${page}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}` 
        }
      });
      
      const res = await response.json();
      if (res.success) {
        setMedicines(res.data || []);
        setTotalPages(res.totalPages || 1);
        setTotalItems(res.totalItems || 0);
        setCurrentPage(res.currentPage || page);
      }
    } catch (err) {
      console.error("Grid Synchronizer Failure:", err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    fetchPage(currentPage); 
  }, [currentPage, fetchPage]);

  // --- 3. MUTATION HANDLERS (ADD & UPDATE ENGINE) ---
  const handleInputChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("pharmacyToken");
      
      // Explicit data extraction configuration mapping to strict backend schemas
      const payload = {
        name: form.name.trim(),
        genericName: form.genericName.trim(),
        strength: form.strength.trim(),
        price: Number(form.price),
        stock: Number(form.stock),
        company: form.company.trim(),
        batchNumber: form.batchNumber.trim(),
        expiryDate: form.expiryDate
      };

      if (editingId) {
        // ⚡ MULTI-TENANT SECURED UPDATE ACTION
        const response = await fetch(`http://localhost:5000/api/medicines/${editingId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
        const resData = await response.json();
        if (!resData.success) throw new Error(resData.message);
      } else {
        // ⚡ MULTI-TENANT SECURED ADD ACTION
        const response = await fetch("http://localhost:5000/api/medicines", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
        const resData = await response.json();
        if (!resData.success) throw new Error(resData.message);
      }

      // Reset application state structures
      setForm({ name: "", price: "", stock: "", company: "", genericName: "", strength: "", batchNumber: "", expiryDate: "" });
      setShowForm(false);
      setEditingId(null);
      
      fetchPage(currentPage); 
      alert("Inventory Matrix Successfully Synchronized! ✅"); 

    } catch (err) {
      alert("Operational Block: " + err.message);
    }
  };

  // --- 4. GRID RECORD ACTIONS ---
  const handleEdit = (m) => {
    setForm({ 
      name: m.name, 
      price: m.price, 
      stock: m.stock, 
      company: m.company || "",
      genericName: m.genericName || "", 
      strength: m.strength || "",
      batchNumber: m.batchNumber || "", 
      expiryDate: m.expiryDate ? m.expiryDate.split("T")[0] : "" 
    });
    setEditingId(m._id); 
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you secure you want to purge this record entry?")) return;
    try {
      const token = localStorage.getItem("pharmacyToken");
      
      // ⚡ MULTI-TENANT SECURED DELETE ACTION
      const response = await fetch(`http://localhost:5000/api/medicines/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      const resData = await response.json();
      if (resData.success) {
        alert("Medical record purged successfully. 🗑️");
        fetchPage(currentPage); 
      } else {
        alert("Purge verification rejected: " + resData.message);
      }
    } catch (err) {
      alert("Operational Interruption: " + err.message);
    }
  };

  // --- 5. CSV EXPORT UTILITY ---
  const handleExportCSV = () => {
    const cols = ["Name", "Formula/Generic", "Strength", "Price", "Stock", "Company", "Batch #", "Expiry Date"];
    const csvRows = medicines.map(m => [
      `"${m.name}"`, `"${m.genericName || ''}"`, `"${m.strength || ''}"`, 
      m.price, m.stock, `"${m.company || ''}"`, `"${m.batchNumber || ''}"`, `"${m.expiryDate ? m.expiryDate.split('T')[0] : ''}"`
    ].join(","));
    const blob = new Blob([[cols.join(","), ...csvRows].join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement("a"), { href: url, download: "Pharmacy_Inventory.csv" });
    a.click(); URL.revokeObjectURL(url);
  };

  // --- 6. PAGINATION BUILDER ---
  const renderPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);

    for (let i = start; i <= end; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          style={{
            padding: "8px 15px", margin: "0 4px", borderRadius: "6px",
            background: currentPage === i ? "var(--gold)" : "white",
            color: currentPage === i ? "#0f172a" : "#334155",
            cursor: "pointer", fontWeight: "bold", border: "1px solid #ddd"
          }}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <div className="main-content" style={{ flex: 1, marginLeft: "var(--sidebar-w)" }}>
        <Navbar />
        <div className="page-content" style={{ padding: "30px" }}>
          
          <div className="page-header" style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px", alignItems: "center" }}>
            <div>
              <h1 style={{ fontSize: "24px", fontWeight: "800" }}>Medicine Inventory</h1>
              <p>Managing <strong>{totalItems}</strong> isolated items from Atlas</p>
            </div>
            
            <div style={{ display: "flex", gap: "10px" }}>
              <button className="btn btn-outline" onClick={handleExportCSV}>
                📤 Export CSV
              </button>

              <label className="btn btn-gold" style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", margin: 0 }}>
                📥 Import CSV
                <input 
                  type="file" 
                  accept=".csv" 
                  style={{ display: "none" }} 
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;

                    const formData = new FormData();
                    formData.append("file", file);

                    try {
                      const token = localStorage.getItem("pharmacyToken");
                      
                      const response = await fetch("http://localhost:5000/api/medicines/bulk-import", {
                        method: "POST",
                        headers: {
                          "Authorization": `Bearer ${token}`
                        },
                        body: formData
                      });
                      
                      const resData = await response.json();
                      if (resData.success) {
                        alert(`⚡ Success! ${resData.count} medicines parsed and isolated successfully!`);
                        fetchPage(1); 
                      } else {
                        alert("Upload verification breakdown: " + resData.message);
                      }
                    } catch (err) {
                      alert("Stream Processing Failure: " + err.message);
                    }
                  }}
                />
              </label>

              <button className="btn btn-gold" onClick={() => { setShowForm(!showForm); setEditingId(null); }}>
                {showForm ? "✕ Close Workspace" : "+ Add Medicine"}
              </button>
            </div>
          </div>

          {/* DYNAMIC FORM BOARD */}
          {showForm && (
            <form onSubmit={handleSubmit} className="card" style={{ padding: "25px", marginBottom: "20px", background: "white", borderRadius: "12px" }}>
              <h3 style={{ marginBottom: "15px", color: "var(--navy)" }}>{editingId ? "✏️ Edit Medicine Profile" : "➕ Add New Medical Record"}</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "14px" }}>
                
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "600" }}>Medicine Name *</label>
                  <input name="name" placeholder="e.g. Panadol" value={form.name} onChange={handleInputChange} required style={{ width: "100%", marginTop: "4px" }} />
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "600" }}>Generic Formula *</label>
                  <input name="genericName" placeholder="e.g. Paracetamol" value={form.genericName} onChange={handleInputChange} required style={{ width: "100%", marginTop: "4px" }} />
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "600" }}>Strength / Mg</label>
                  <input name="strength" placeholder="e.g. 500mg" value={form.strength} onChange={handleInputChange} style={{ width: "100%", marginTop: "4px" }} />
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "600" }}>Retail Price (Rs) *</label>
                  <input name="price" placeholder="Price" type="number" value={form.price} onChange={handleInputChange} required style={{ width: "100%", marginTop: "4px" }} />
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "600" }}>Current Stock *</label>
                  <input name="stock" placeholder="Stock Qty" type="number" value={form.stock} onChange={handleInputChange} required style={{ width: "100%", marginTop: "4px" }} />
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "600" }}>Manufacturer Company</label>
                  <input name="company" placeholder="e.g. GSK" value={form.company} onChange={handleInputChange} style={{ width: "100%", marginTop: "4px" }} />
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "600" }}>Batch Number</label>
                  <input name="batchNumber" placeholder="e.g. BT-9921" value={form.batchNumber} onChange={handleInputChange} style={{ width: "100%", marginTop: "4px" }} />
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "600" }}>Expiry Date *</label>
                  <input name="expiryDate" type="date" value={form.expiryDate} onChange={handleInputChange} required style={{ width: "100%", marginTop: "4px" }} />
                </div>

              </div>
              <button type="submit" className="btn btn-gold" style={{ marginTop: "18px", width: "100%" }}>
                💾 Commit Matrix Changes to Cluster Node
              </button>
            </form>
          )}

          {/* MEDICAL RECORDS GRID BOARD */}
          <div className="card" style={{ background: "white", borderRadius: "12px", boxShadow: "var(--shadow)", overflow: "hidden" }}>
            {loading ? (
              <div style={{ padding: "60px", textAlign: "center" }}>⏳ Parsing Distributed Node Packets...</div>
            ) : (
              <div className="table-wrap">
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead style={{ background: "#f8fafc", textAlign: "left" }}>
                    <tr>
                      <th style={{ padding: "16px" }}>#</th>
                      <th>MEDICINE NAME</th>
                      <th>FORMULA (GENERIC)</th>
                      <th>STRENGTH</th>
                      <th>PRICE</th>
                      <th>STOCK</th>
                      <th>EXPIRY DATE</th>
                      <th style={{ textAlign: "center" }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medicines.length === 0 ? (
                      <tr>
                        <td colSpan="8" style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>No tenant data nodes allocated in this tracking boundary set. Import CSV sheet!</td>
                      </tr>
                    ) : (
                      medicines.map((m, index) => {
                        const isExpired = m.expiryDate && new Date(m.expiryDate) < new Date();
                        return (
                          <tr key={m._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                            <td style={{ padding: "16px" }}>{(currentPage - 1) * 50 + index + 1}</td>
                            <td><strong>{m.name}</strong><br/><span style={{ fontSize: "11px", color: "#64748b" }}>{m.company || "—"}</span></td>
                            <td style={{ fontSize: "13px", color: "#475569" }}>{m.genericName || "—"}</td>
                            <td><span style={{ background: "#f1f5f9", padding: "2px 8px", borderRadius: "4px", fontSize: "12px" }}>{m.strength || "—"}</span></td>
                            <td>Rs {m.price}</td>
                            <td><span className={`badge ${m.stock < 20 ? "badge-red" : "badge-green"}`}>{m.stock} units</span></td>
                            <td>
                              <span style={{ color: isExpired ? "var(--red)" : "#334155", fontWeight: isExpired ? "700" : "500" }}>
                                {m.expiryDate ? m.expiryDate.split("T")[0] : "—"} {isExpired && "⚠️"}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                                <button onClick={() => handleEdit(m)} className="btn btn-blue btn-sm">✏️</button>
                                <button onClick={() => handleDelete(m._id)} className="btn btn-red btn-sm">🗑️</button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>

                {/* PAGINATION GRID TIMINGS */}
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "20px", background: "#fafafa", gap: "8px" }}>
                  <button disabled={currentPage === 1} onClick={() => setCurrentPage(1)} style={{ padding: "8px 12px", cursor: "pointer", borderRadius: "6px", border: "1px solid #ddd" }}>«</button>
                  <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} style={{ padding: "8px 12px", cursor: "pointer", borderRadius: "6px", border: "1px solid #ddd" }}>‹</button>
                  {renderPageNumbers()}
                  <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} style={{ padding: "8px 12px", cursor: "pointer", borderRadius: "6px", border: "1px solid #ddd" }}>›</button>
                  <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(totalPages)} style={{ padding: "8px 12px", cursor: "pointer", borderRadius: "6px", border: "1px solid #ddd" }}>»</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Medicines;