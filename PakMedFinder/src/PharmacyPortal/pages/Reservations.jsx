import React, { useState, useEffect, useMemo } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import "../PortalStyles.css";
import { getReservations, addReservation, deleteReservation, updateReservation } from "../../api";

/* ─── Date helpers ──────────────────────────────────────── */
const todayStr  = () => new Date().toISOString().split("T")[0];
const in2Days   = () => {
  const d = new Date(); d.setDate(d.getDate() + 2);
  return d.toISOString().split("T")[0];
};
const isDueSoon = (date) => date && date >= todayStr() && date <= in2Days();

/* ─── Status logic ──────────────────────────────────────── */
const deriveStatus = (r) => {
  if (r.status === "cancelled")  return "cancelled";
  if (r.status === "completed")  return "completed";
  if (!r.date || r.date >= todayStr()) return "upcoming";
  return "past";
};

const STATUS = {
  upcoming:  { label: "Upcoming",  icon: "📅", badgeCls: "badge-blue"  },
  past:      { label: "Past",      icon: "🕐", badgeCls: "badge-amber" },
  completed: { label: "Completed", icon: "✅", badgeCls: "badge-green" },
  cancelled: { label: "Cancelled", icon: "🚫", badgeCls: "badge-red"   },
};

/* ─── CSV export ────────────────────────────────────────── */
const buildCSV = (rows) => {
  const cols = ["#","Name","Email","Phone","Location","Medicine","Quantity","Date","Status","Notes"];
  const escape = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = rows.map((r, i) => [
    i + 1,
    escape(r.name),
    escape(r.email),
    escape(r.phone),
    escape(r.location),
    escape(r.medicine),
    r.quantity ?? 1,
    r.date ?? "",
    deriveStatus(r),
    escape(r.notes),
  ].join(","));
  return [cols.join(","), ...lines].join("\n");
};

const downloadCSV = (rows) => {
  const blob = new Blob([buildCSV(rows)], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement("a"), { href: url, download: "reservations.csv" });
  a.click(); URL.revokeObjectURL(url);
};

/* ═══════════════════════════════════════════════════════════
   Component
═══════════════════════════════════════════════════════════ */
const EMPTY_FORM = { name:"", email:"", phone:"", location:"", medicine:"", quantity:1, date:"", notes:"" };

const Reservations = () => {
  const [reservations, setReservations] = useState([]);
  const [showForm,     setShowForm]     = useState(false);
  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [error,        setError]        = useState("");
  const [form,         setForm]         = useState(EMPTY_FORM);
  const [search,       setSearch]       = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  /* ── fetch ── */
  /* ── fetch (Safe Response Parsing) ── */
  const fetchReservations = async () => {
    try {
      setLoading(true);
      const res = await getReservations();
      
      // ✨ Object wrapper parsing support
      if (res && res.data && Array.isArray(res.data.data)) {
         setReservations(res.data.data);
      } else if (res && Array.isArray(res.data)) {
         setReservations(res.data);
      } else {
         setReservations([]); // Safe fallback
      }
      
      setError("");
    } catch (err) { 
      setError(err.message); 
    } finally { 
      setLoading(false); 
    }
  };
  useEffect(() => { fetchReservations(); }, []);

  /* ── form ── */
  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.medicine.trim()) {
      alert("Customer Name and Medicine are required.");
      return;
    }
    try {
      setSaving(true);
      await addReservation({ ...form, quantity: Number(form.quantity) || 1 });
      setForm(EMPTY_FORM);
      setShowForm(false);
      fetchReservations();
    } catch (err) { alert("Error: " + err.message); }
    finally { setSaving(false); }
  };


/* ── updated actions ── */
const handleCancel = async (id) => {
  if (!window.confirm("Cancel this reservation?")) return;
  try {
    // API call to update status in Atlas
    const res = await updateReservation(id, { status: "cancelled" });
    if (res.success) {
      setReservations((prev) => prev.map((r) => r._id === id ? { ...r, status: "cancelled" } : r));
    }
  } catch (err) {
    alert("Cancel failed: " + err.message);
  }
};

const handleComplete = async (id) => {
  try {
    // API call to mark as completed in Atlas
    const res = await updateReservation(id, { status: "completed" });
    if (res.success) {
      setReservations((prev) => prev.map((r) => r._id === id ? { ...r, status: "completed" } : r));
      alert("Reservation marked as Completed! ✅");
    }
  } catch (err) {
    alert("Update failed: " + err.message);
  }
};
  /* ── derived counts ── */
  const counts = useMemo(() => ({
    total:     reservations.length,
    upcoming:  reservations.filter((r) => deriveStatus(r) === "upcoming").length,
    completed: reservations.filter((r) => deriveStatus(r) === "completed").length,
    cancelled: reservations.filter((r) => deriveStatus(r) === "cancelled").length,
  }), [reservations]);

  /* ── filtered rows ── */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return reservations.filter((r) => {
      const matchSearch = !q ||
        r.name.toLowerCase().includes(q) ||
        r.medicine.toLowerCase().includes(q) ||
        (r.email ?? "").toLowerCase().includes(q);
      const matchFilter = activeFilter === "all" || deriveStatus(r) === activeFilter;
      return matchSearch && matchFilter;
    });
  }, [reservations, search, activeFilter]);

  /* ── stat card config ── */
  const STATS = [
    { key:"all",       label:"Total",     value:counts.total,     icon:"📋", color:"var(--blue)",  bg:"var(--blue-light)"  },
    { key:"upcoming",  label:"Upcoming",  value:counts.upcoming,  icon:"⏰", color:"var(--green)", bg:"var(--green-light)" },
    { key:"completed", label:"Completed", value:counts.completed, icon:"✅", color:"#059669",      bg:"#d1fae5"            },
    { key:"cancelled", label:"Cancelled", value:counts.cancelled, icon:"🚫", color:"var(--red)",   bg:"#fee2e2"            },
  ];

  /* ══════════════════════════════════════════════════════ */
  return (
    <div style={{ display:"flex", width:"100%", maxWidth:"100vw", overflowX:"hidden" }}>
      <Sidebar />
      <div
        className="main-content"
        style={{ flex:"1 1 0%", minWidth:0, width:"100%" }}
      >
        <Navbar />
        <div className="page-content" style={{ width:"100%", maxWidth:"100%", boxSizing:"border-box" }}>

          {/* ── Page Header ── */}
          <div className="page-header">
            <div>
              <h1>Reservations</h1>
              <p>Scheduled medicine reservations for customers</p>
            </div>
            <div style={{ display:"flex", gap:"10px" }}>
              <button
                className="btn btn-outline"
                onClick={() => downloadCSV(filtered)}
                title="Export filtered rows as CSV"
              >
                📥 Export CSV
              </button>
              <button className="btn btn-gold" onClick={() => setShowForm((v) => !v)}>
                {showForm ? "✕ Close" : "➕ New Reservation"}
              </button>
            </div>
          </div>

          {/* ── Add Form ── */}
          {showForm && (
            <div className="card mb-6">
              <div className="card-header">
                <div className="card-title">➕ New Reservation</div>
              </div>
              <div className="card-body">
                <div className="form-grid-3" style={{ marginBottom:"14px" }}>
                  <div className="form-group">
                    <label>Customer Name *</label>
                    <input name="name" placeholder="Full name" value={form.name} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input name="email" type="email" placeholder="email@example.com" value={form.email} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input name="phone" placeholder="+92 300 0000000" value={form.phone} onChange={handleChange} />
                  </div>
                </div>

                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 80px 160px", gap:"14px", marginBottom:"14px" }}>
                  <div className="form-group">
                    <label>Location / City</label>
                    <input name="location" placeholder="City or area" value={form.location} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>Medicine *</label>
                    <input name="medicine" placeholder="Medicine name" value={form.medicine} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>Qty</label>
                    <input name="quantity" type="number" min="1" placeholder="1" value={form.quantity} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>Date</label>
                    <input name="date" type="date" value={form.date} onChange={handleChange} />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom:"14px" }}>
                  <label>Notes / Special Instructions</label>
                  <input name="notes" placeholder="Any special instructions..." value={form.notes} onChange={handleChange} />
                </div>

                <button className="btn btn-gold" onClick={handleSubmit} disabled={saving}>
                  {saving ? "Saving…" : "💾 Save Reservation"}
                </button>
              </div>
            </div>
          )}

          {/* ── Stat Cards (clickable filters) ── */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(140px, 1fr))", gap:"16px", marginBottom:"20px" }}>
            {STATS.map((s) => {
              const active = activeFilter === s.key;
              return (
                <div
                  key={s.key}
                  onClick={() => setActiveFilter(active ? "all" : s.key)}
                  style={{
                    background:   active ? s.color : "white",
                    borderRadius: "var(--radius)",
                    padding:      "18px 22px",
                    boxShadow:    "var(--shadow)",
                    border:       `2px solid ${active ? s.color : "var(--border)"}`,
                    display:      "flex",
                    alignItems:   "center",
                    gap:          "14px",
                    cursor:       "pointer",
                    transition:   "all .17s ease",
                    userSelect:   "none",
                  }}
                >
                  <div style={{
                    width:"42px", height:"42px", borderRadius:"12px",
                    background: active ? "rgba(255,255,255,.22)" : s.bg,
                    display:"flex", alignItems:"center", justifyContent:"center", fontSize:"20px",
                  }}>
                    {s.icon}
                  </div>
                  <div>
                    <div style={{ fontSize:"26px", fontWeight:"800", lineHeight:"1", color: active ? "white" : s.color }}>
                      {s.value}
                    </div>
                    <div style={{ fontSize:"12px", marginTop:"3px", color: active ? "rgba(255,255,255,.8)" : "var(--text-muted)" }}>
                      {s.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Error ── */}
          {error && (
            <div style={{ background:"#fff5f5", border:"1px solid #fecaca", borderRadius:"var(--radius)", padding:"12px 18px", color:"var(--red)", marginBottom:"16px" }}>
              ❌ {error}
            </div>
          )}

          {/* ── Search + Filter Buttons ── */}
          <div style={{ display:"flex", gap:"12px", marginBottom:"16px", flexWrap:"wrap", alignItems:"center" }}>
            <div style={{ position:"relative", flex:"1", minWidth:"220px" }}>
              <span style={{ position:"absolute", left:"12px", top:"50%", transform:"translateY(-50%)", fontSize:"15px", pointerEvents:"none", opacity:.6 }}>
                🔍
              </span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, medicine or email…"
                style={{
                  paddingLeft:"36px", width:"100%", height:"38px",
                  borderRadius:"var(--radius)", border:"1px solid var(--border)",
                  fontSize:"14px", boxSizing:"border-box",
                }}
              />
            </div>
            {["all","upcoming","past","completed","cancelled"].map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`btn btn-sm ${activeFilter === f ? "btn-gold" : "btn-outline"}`}
                style={{ textTransform:"capitalize", whiteSpace:"nowrap" }}
              >
                {f === "all" ? "All" : `${STATUS[f].icon} ${STATUS[f].label}`}
              </button>
            ))}
          </div>

          {/* ── Table ── */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">📅 Reservations</div>
              <span style={{ fontSize:"13px", color:"var(--text-muted)" }}>
                {filtered.length} of {reservations.length} shown
              </span>
            </div>

            {loading ? (
              <div style={{ padding:"40px", textAlign:"center", color:"var(--text-muted)" }}>⏳ Loading reservations…</div>
            ) : (
              <div className="table-wrap" style={{ overflowX: "auto", width: "100%", WebkitOverflowScrolling: "touch" }}>
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Customer</th>
                      <th>📧 Email</th>
                      <th>📞 Phone</th>
                      <th>📍 Location</th>
                      <th>💊 Medicine</th>
                      <th style={{ textAlign:"center" }}>Qty</th>
                      <th>📆 Date</th>
                      <th>Status</th>
                      <th>📝 Notes</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length ? filtered.map((r, i) => {
                      const status = deriveStatus(r);
                      const sm     = STATUS[status];
                      const due    = status === "upcoming" && isDueSoon(r.date);
                      const muted  = status === "cancelled" || status === "completed";

                      return (
                        <tr key={r._id} style={{ opacity: muted ? 0.65 : 1 }}>
                          <td style={{ color:"var(--text-muted)" }}>{i + 1}</td>

                          <td>
                            <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                              <div style={{
                                width:"32px", height:"32px", borderRadius:"8px", flexShrink:0,
                                background:"var(--green-light)", display:"flex", alignItems:"center",
                                justifyContent:"center", fontWeight:"700", fontSize:"13px", color:"var(--green)",
                              }}>
                                {r.name.charAt(0).toUpperCase()}
                              </div>
                              <strong style={{ whiteSpace:"nowrap" }}>{r.name}</strong>
                            </div>
                          </td>

                          <td style={{ fontSize:"13px" }}>
                            {r.email
                              ? <a href={`mailto:${r.email}`} style={{ color:"var(--blue)", textDecoration:"none" }}>{r.email}</a>
                              : <span style={{ color:"var(--text-muted)" }}>—</span>}
                          </td>

                          <td style={{ fontSize:"13px", whiteSpace:"nowrap" }}>
                            {r.phone
                              ? <a href={`tel:${r.phone}`} style={{ color:"var(--blue)", textDecoration:"none" }}>{r.phone}</a>
                              : <span style={{ color:"var(--text-muted)" }}>—</span>}
                          </td>

                          <td style={{ fontSize:"13px" }}>
                            {r.location || <span style={{ color:"var(--text-muted)" }}>—</span>}
                          </td>

                          <td><strong>{r.medicine}</strong></td>

                          <td style={{ textAlign:"center" }}>
                            <span style={{
                              background:"var(--blue-light)", color:"var(--blue)",
                              borderRadius:"6px", padding:"2px 10px", fontWeight:"700", fontSize:"13px",
                            }}>
                              {r.quantity ?? 1}
                            </span>
                          </td>

                          <td style={{ whiteSpace:"nowrap" }}>
                            {r.date || <span style={{ color:"var(--text-muted)" }}>—</span>}
                            {due && (
                              <span style={{
                                marginLeft:"6px", background:"#fef3c7", color:"#d97706",
                                borderRadius:"5px", padding:"1px 7px", fontSize:"11px", fontWeight:"700",
                              }}>
                                ⏰ Due Soon
                              </span>
                            )}
                          </td>

                          <td>
                            <span className={`badge ${sm.badgeCls}`}>{sm.icon} {sm.label}</span>
                          </td>

                          <td
                            title={r.notes || ""}
                            style={{
                              fontSize:"12px", color:"var(--text-muted)",
                              maxWidth:"150px", overflow:"hidden",
                              textOverflow:"ellipsis", whiteSpace:"nowrap",
                            }}
                          >
                            {r.notes || "—"}
                          </td>

                          <td>
                            <div style={{ display:"flex", gap:"6px" }}>
                              {status === "upcoming" && (
                                <>
                                  <button
                                    className="btn btn-sm"
                                    style={{ background:"#d1fae5", color:"#059669", border:"none", fontWeight:"600" }}
                                    onClick={() => handleComplete(r._id)}
                                    title="Mark as Completed"
                                  >
                                    ✅
                                  </button>
                                  <button
                                    className="btn btn-red btn-sm"
                                    onClick={() => handleCancel(r._id)}
                                    title="Cancel Reservation"
                                  >
                                    🚫
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    }) : (
                      <tr>
                        <td colSpan="11">
                          <div className="empty-state">
                            <div className="empty-icon">📅</div>
                            <h3>No reservations found</h3>
                            <p>
                              {search || activeFilter !== "all"
                                ? "Try adjusting your search or filter."
                                : "Reservations will appear here."}
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Reservations;