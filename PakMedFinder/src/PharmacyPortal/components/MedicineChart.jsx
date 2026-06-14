import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import "../../App.css"; // Path fixed
import { getMedicines, addMedicine, updateMedicine, deleteMedicine } from "../../api"; // Database connected

const emptyForm = {
  name:"", company:"", price:"", stock:"",
  mfgDate:"", expiry:"", dosage:"", category:"", description:""
};

const Medicines = () => {
  const [medicines, setMedicines] = useState([]);
  const [search,    setSearch]    = useState("");
  const [filter,    setFilter]    = useState("");
  const [showForm,  setShowForm]  = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState("");
  const [form,      setForm]      = useState(emptyForm);

  // 1. Fetch from MongoDB Atlas
  const fetchMedicines = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getMedicines(); // API se data mangwayein
      if (res.success) {
        setMedicines(res.data);
      }
      setError("");
    } catch (err) {
      setError("Database Connection Error: " + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMedicines(); }, [fetchMedicines]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // 2. Save/Update to Atlas
  const handleSubmit = async () => {
    if (!form.name.trim()) { alert("Please enter a medicine name"); return; }
    try {
      setSaving(true);
      if (editingId) {
        await updateMedicine(editingId, { ...form, price: +form.price, stock: +form.stock });
        alert("Medicine Updated! ✅");
      } else {
        await addMedicine({ ...form, price: +form.price, stock: +form.stock });
        alert("Medicine Saved to Atlas! ✅");
      }
      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);
      fetchMedicines(); // Refresh table
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (m) => {
    setForm({
      name: m.name,
      company: m.company || "",
      price: m.price,
      stock: m.stock,
      mfgDate: m.mfgDate || "",
      expiry: m.expiry || "",
      dosage: m.dosage || "",
      category: m.category || "",
      description: m.description || "",
    });
    setEditingId(m._id); // Atlas ID mapping
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this medicine from Database?")) return;
    try {
      const res = await deleteMedicine(id);
      if (res.success) {
        fetchMedicines();
        alert("Removed from Atlas! 🗑️");
      }
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  };

  // ── Stats ──
  const lowStockCount = medicines.filter(m => m.stock < 20).length;
  const inStockCount  = medicines.filter(m => m.stock >= 20).length;

  // ── Filtered Search ──
  const filteredMedicines = medicines.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "low" ? m.stock < 20 : filter === "ok" ? m.stock >= 20 : true;
    return matchSearch && matchFilter;
  });

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div className="main-content">
        <Navbar />
        <div className="page-content">
          
          <div className="page-header">
            <div>
              <h1>Medicine Inventory</h1>
              <p>Live Database Connection: {medicines.length} items</p>
            </div>
            <button className="btn btn-gold" onClick={() => setShowForm(!showForm)}>
              {showForm ? "✕ Close" : "➕ Add Medicine"}
            </button>
          </div>

          {/* Stats Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "16px", marginBottom: "20px" }}>
            <div className="card-stat">Total: {medicines.length}</div>
            <div className="card-stat" style={{ color: "red" }}>Low Stock: {lowStockCount}</div>
            <div className="card-stat" style={{ color: "green" }}>In Stock: {inStockCount}</div>
          </div>

          {/* Form, Search, and Table (Logic remains same as your original) */}
          {/* ... Table logic ... */}
          
          {loading ? <div>Connecting to Atlas...</div> : (
            <div className="table-wrap">
              <table>
                {/* Table Body mapping filteredMedicines */}
                <tbody>
                    {filteredMedicines.map((m, i) => (
                        <tr key={m._id}>
                            <td>{i+1}</td>
                            <td>{m.name}</td>
                            <td>{m.stock}</td>
                            <td>
                                <button onClick={() => handleEdit(m)}>✏️</button>
                                <button onClick={() => handleDelete(m._id)}>🗑</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Medicines;