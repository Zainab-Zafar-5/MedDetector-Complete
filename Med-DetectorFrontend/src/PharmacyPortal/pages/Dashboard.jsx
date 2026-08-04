import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import "../PortalStyles.css";
import { getDashboard, getMedicines, getPharmacyFeedback, replyToFeedback } from "../../api";

const Dashboard = () => {
  const [data,          setData]          = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState("");
  const [chartSearch,   setChartSearch]   = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMeds,  setSelectedMeds]  = useState([]);
  const [allMedicines,  setAllMedicines]  = useState([]);
  const [showDropdown,  setShowDropdown]  = useState(false);
  const searchRef = useRef(null);

  const [feedbackList, setFeedbackList]   = useState([]);
  const [feedbackLoading, setFeedbackLoading] = useState(true);
  const [replyDrafts, setReplyDrafts]     = useState({});
  const [replySubmitting, setReplySubmitting] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target))
        setShowDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const fetch_ = async () => {
      try {
        setLoading(true);
        const [dashRes, medsRes] = await Promise.all([getDashboard(), getMedicines()]);

        // ⚡ FIXED DYNAMIC DATA DESERIALIZATION LAYER
        // Axios interceptor arrays properties target logic setup cleanly mapped here
        const dashData = dashRes?.data?.success ? dashRes.data : (dashRes?.data || dashRes);
        setData(dashData);

        const meds = Array.isArray(medsRes?.data?.data) ? medsRes.data.data :
                     (Array.isArray(medsRes?.data) ? medsRes.data :
                     (Array.isArray(medsRes) ? medsRes : []));
        setAllMedicines(meds);

        // Chart default view: Top 10 Critical
        if (meds.length > 0) {
          const sorted = [...meds].sort((a, b) => (a.stock || 0) - (b.stock || 0));
          setSelectedMeds(sorted.slice(0, 10));
        }
      } catch (err) {
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, []);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        setFeedbackLoading(true);
        const res = await getPharmacyFeedback();
        const list = Array.isArray(res?.data?.data) ? res.data.data : (Array.isArray(res?.data) ? res.data : []);
        setFeedbackList(list);
      } catch (err) {
        console.error("Failed to load feedback:", err);
      } finally {
        setFeedbackLoading(false);
      }
    };
    fetchFeedback();
  }, []);

  const handleReplyChange = (id, text) =>
    setReplyDrafts(prev => ({ ...prev, [id]: text }));

  const handleReplySubmit = async (id) => {
    const text = (replyDrafts[id] || "").trim();
    if (!text) return;
    try {
      setReplySubmitting(id);
      await replyToFeedback(id, text);
      setFeedbackList(prev =>
        prev.map(f => f._id === id ? { ...f, reply: { text, repliedAt: new Date() } } : f)
      );
      setReplyDrafts(prev => ({ ...prev, [id]: "" }));
    } catch (err) {
      alert("Failed to submit reply");
    } finally {
      setReplySubmitting(null);
    }
  };

  useEffect(() => {
    if (!chartSearch.trim() || !Array.isArray(allMedicines)) { setSearchResults([]); setShowDropdown(false); return; }
    const filtered = allMedicines.filter(m => (m.name || "").toLowerCase().includes(chartSearch.toLowerCase()));
    setSearchResults(filtered.slice(0, 8));
    setShowDropdown(true);
  }, [chartSearch, allMedicines]);

  const addToChart = (med) => { if (!selectedMeds.find(m => m._id === med._id)) setSelectedMeds(prev => [...prev, med]); setChartSearch(""); setShowDropdown(false); };
  const clearChart = () => setSelectedMeds([]);
  const showAll    = () => { if (allMedicines.length > 0) { const s = [...allMedicines].sort((a,b) => (a.stock || 0) - (b.stock || 0)); setSelectedMeds(s.slice(0, 10)); setChartSearch(""); } };

  if (loading) return (
    <div style={{ display:"flex", width:"100%", maxWidth:"100vw", overflowX:"hidden" }}><Sidebar /><div className="main-content" style={{ flex:"1 1 0%", minWidth:0, width:"100%" }}><Navbar /><div className="page-content" style={{textAlign:"center", marginTop:"20%", width:"100%", boxSizing:"border-box"}}>⏳ Fetching Full Inventory Records...</div></div></div>
  );

  // Destructuring metrics safety fields
  const { cards = {}, notifications = [], lowStockList = [], expiryAlert = [], expiredMeds = [] } = data || {};
  const currentMeds = Array.isArray(selectedMeds) ? selectedMeds : [];
  const maxStock = currentMeds.length > 0 ? Math.max(...currentMeds.map(m => m.stock || 0), 1) : 1;
  const chartColors = ["#2563eb","#10b981","#f59e0b","#ef4444","#8b5cf6","#06b6d4","#ec4899","#14b8a6","#f97316","#84cc16"];

  return (
    <div style={{ display:"flex", width:"100%", maxWidth:"100vw", overflowX:"hidden" }}>
      <Sidebar />
      <div className="main-content" style={{ flex:"1 1 0%", minWidth:0, width:"100%" }}>
        <Navbar />
        <div className="page-content" style={{ width:"100%", maxWidth:"100%", boxSizing:"border-box" }}>

          {/* 1. UPPER SECTION: DYNAMIC LOW STOCK INVENTORY TABLE */}
          {lowStockList?.length > 0 && (
            <div style={{ background: "#fff1f0", border: "1px solid #ffa39e", borderRadius: "12px", padding: "20px", marginBottom: "25px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "20px" }}>⚠️</span>
                  <div style={{ fontSize: "16px", fontWeight: "700", color: "#cf1322" }}>
                    Critical Low Stock Inventory ({lowStockList.length} items)
                  </div>
                </div>
                <span style={{ fontSize: "11px", color: "#8c8c8c", fontWeight: "600" }}>Scroll to see full inventory</span>
              </div>

              <div style={{ maxHeight: "250px", overflowY: "auto", background: "white", borderRadius: "10px", border: "1px solid #ffccc7" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead style={{ position: "sticky", top: 0, background: "#fff1f0", zIndex: 10 }}>
                    <tr style={{ textAlign: "left", color: "#434343", borderBottom: "2px solid #ffa39e" }}>
                      <th style={{ padding: "12px" }}>MEDICINE NAME</th>
                      <th style={{ padding: "12px" }}>COMPANY</th>
                      <th style={{ padding: "12px", textAlign: "center" }}>STOCK</th>
                      <th style={{ padding: "12px" }}>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStockList.map((m, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #f0f0f0" }}>
                        <td style={{ padding: "10px 12px", fontWeight: "600" }}>{m.name}</td>
                        <td style={{ padding: "10px 12px", color: "#666" }}>{m.company || "N/A"}</td>
                        <td style={{ padding: "10px 12px", textAlign: "center" }}>
                          <span style={{ color: "#cf1322", fontWeight: "800", background: "#fff1f0", padding: "2px 8px", borderRadius: "4px" }}>
                            {m.stock}
                          </span>
                        </td>
                        <td style={{ padding: "10px 12px" }}>
                          <span style={{
                            fontSize: "10px",
                            background: Number(m.stock) === 0 ? "#ef4444" : "#f59e0b",
                            color: "white",
                            padding: "6px 12px",
                            borderRadius: "4px",
                            fontWeight: "700",
                            display: "inline-block"
                          }}>
                            {Number(m.stock) === 0 ? "OUT OF STOCK" : "REORDER NOW"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 2. STAT CARDS CONTAINER */}
           <div className="stat-grid" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"20px", marginBottom:"28px" }}>

            {[
              { label:"Total Medicines", value:cards.totalMedicines || 0, color:"#2563eb" },
              { label:"Requests",        value:cards.totalRequests || 0,  color:"#f59e0b" },
              { label:"Reservations",    value:cards.totalReservations || 0, color:"#10b981" },
              { label:"Low Stock",       value:cards.lowStock || 0,       color:"#ef4444" },
            ].map((s,i) => (
              <div key={i} className="card" style={{ background:"white", padding:"22px", borderRadius:"15px", border:"1px solid #eee" }}>
                <div style={{ fontSize:"32px", fontWeight:"800", color:s.color }}>{s.value}</div>
                <div style={{ fontSize:"13px", color:"#64748b", fontWeight:"600" }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* 3. CHART & NOTIFICATIONS PANEL */}
          <div className="chart-notif-grid" style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:"20px", marginBottom:"25px" }}>

            <div className="card" style={{ background:"white", padding:"25px", borderRadius:"15px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"15px", alignItems:"center" }}>
                <h3 style={{ fontSize:"16px", fontWeight:"700" }}>📊 Stock Level Comparison</h3>

                {/* Search Input Section */}
                <div style={{ position: "relative", flex: "1", margin: "0 15px" }} ref={searchRef}>
                  <input
                    type="text"
                    placeholder="Search medicine..."
                    value={chartSearch}
                    onChange={(e) => setChartSearch(e.target.value)}
                    style={{ width: "100%", padding: "6px 10px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "12px" }}
                  />
                  {showDropdown && (
                    <div style={{ position: "absolute", background: "white", border: "1px solid #ddd", borderRadius: "8px", zIndex: 100, width: "100%", marginTop: "5px", maxHeight: "150px", overflowY: "auto", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}>
                      {searchResults.map((m) => (
                        <div key={m._id} onClick={() => addToChart(m)} style={{ padding: "8px", cursor: "pointer", fontSize: "12px", borderBottom: "1px solid #eee" }}>
                          {m.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ display:"flex", gap:"8px" }}>
                  <button onClick={showAll} style={{ padding:"6px 12px", borderRadius:"8px", border:"1px solid #ddd", background:"#f8fafc", cursor:"pointer", fontSize:"12px" }}>Top 10</button>
                  <button onClick={clearChart} style={{ padding:"6px 12px", borderRadius:"8px", border:"1px solid #fecaca", background:"#fff5f5", cursor:"pointer", fontSize:"12px", color:"red" }}>Clear</button>
                </div>
              </div>

              {/* Responsive Chart Container with flexWrap and hidden overflow */}
              <div style={{
                display: "flex",
                alignItems: "flex-end",
                gap: "15px",
                height: "auto",
                minHeight: "180px",
                borderBottom: "2px solid #f1f5f9",
                overflowX: "hidden",
                flexWrap: "wrap",
                paddingBottom: "10px",
                minWidth: 0
              }}>
                {currentMeds.map((m,i) => (
                  <div key={i} style={{ flex: "0 0 50px", display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "10px" }}>
                    <div style={{ width: "100%", height: `${((m.stock||0)/maxStock)*120}px`, background:chartColors[i%10], borderRadius:"4px 4px 0 0", transition: "height 0.3s ease" }} />
                    {/* Medicine Name */}
                    <span style={{ fontSize: "8px", marginTop: "4px", textAlign: "center", whiteSpace: "nowrap", fontWeight: "600", color: "#64748b" }}>
                      {m.name?.slice(0, 6)}
                    </span>
                    {/* Stock Value */}
                    <span style={{ fontSize: "8px", fontWeight: "800", color: "#000", marginTop: "2px" }}>
                      {m.stock}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card" style={{ background:"white", padding:"25px", borderRadius:"15px" }}>
              <h3 style={{ fontSize:"16px", fontWeight:"700", marginBottom:"15px" }}>🔔 Notifications</h3>
              {(notifications || []).map((n,i) => (
                <div key={i} style={{ padding:"10px", background:"#f8fafc", borderRadius:"8px", marginBottom:"10px", fontSize:"13px", borderLeft:"4px solid #2563eb" }}>{n.text}</div>
              ))}
            </div>
          </div>

          {/* 4. BOTTOM TABLES: EXPIRED & EXPIRING SOON */}
         <div className="bottom-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"20px" }}>
            <div className="card" style={{padding:"20px", background:"white", borderRadius:"15px"}}>
              <h3 style={{color:"#ef4444", marginBottom:"15px", fontSize:"15px"}}>❌ Expired Medicines</h3>
              <div style={{maxHeight:"200px", overflowY:"auto"}}>
                <table style={{width:"100%", fontSize:"12px", borderCollapse:"collapse"}}>
                  <thead>
                    <tr style={{textAlign:"left", color:"#94a3b8", borderBottom:"1px solid #eee"}}>
                      <th style={{paddingBottom:"10px"}}>Medicine</th>
                      <th style={{paddingBottom:"10px"}}>Stock</th>
                      <th style={{paddingBottom:"10px"}}>Expiry Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expiredMeds && expiredMeds.length > 0 ? expiredMeds.map((m,i)=>(
                      <tr key={i} style={{borderBottom:"1px solid #f8fafc"}}>
                        <td style={{padding:"10px 0", fontWeight:"600"}}>{m.name}</td>
                        <td>{m.stock} units</td>
                        <td style={{color:"red", fontWeight:"700"}}>{m.expiry}</td>
                      </tr>
                    )) : (
                      <tr><td colSpan="3" style={{textAlign:"center", padding:"30px", color:"#64748b"}}>✨ No expired medicines found in this profile.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card" style={{padding:"20px", background:"white", borderRadius:"15px"}}>
              <h3 style={{color:"#f59e0b", marginBottom:"15px", fontSize:"15px"}}>📅 Expiring Soon (Next 30 Days)</h3>
              <div style={{maxHeight:"200px", overflowY:"auto"}}>
                <table style={{width:"100%", fontSize:"12px", borderCollapse:"collapse"}}>
                  <thead>
                    <tr style={{textAlign:"left", color:"#94a3b8", borderBottom:"1px solid #eee"}}>
                      <th style={{paddingBottom:"10px"}}>Medicine</th>
                      <th style={{paddingBottom:"10px"}}>Stock</th>
                      <th style={{paddingBottom:"10px"}}>Time Remaining</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expiryAlert && expiryAlert.length > 0 ? expiryAlert.map((m,i)=>(
                      <tr key={i} style={{borderBottom:"1px solid #f8fafc"}}>
                        <td style={{padding:"10px 0", fontWeight:"600"}}>{m.name}</td>
                        <td>{m.stock} units</td>
                        <td style={{color:"#f59e0b", fontWeight:"700"}}>{m.daysLeft} days left</td>
                      </tr>
                    )) : (
                      <tr><td colSpan="3" style={{textAlign:"center", padding:"30px", color:"#64748b"}}>✨ Inventory baseline clear! No upcoming expiries.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* 5. CUSTOMER FEEDBACK SECTION */}
          <div className="card" style={{ padding:"20px", background:"white", borderRadius:"15px", marginTop:"20px" }}>
            <h3 style={{ marginBottom:"15px", fontSize:"15px" }}>💬 Customer Feedback ({feedbackList.length})</h3>
            {feedbackLoading ? (
              <div style={{ textAlign:"center", padding:"20px", color:"#64748b" }}>Loading feedback...</div>
            ) : feedbackList.length === 0 ? (
              <div style={{ textAlign:"center", padding:"30px", color:"#64748b" }}>No customer reviews yet.</div>
            ) : (
              <div style={{ maxHeight:"400px", overflowY:"auto" }}>
                {feedbackList.map((f) => (
                  <div key={f._id} style={{ padding:"14px", borderBottom:"1px solid #f0f0f0" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <span>{"★".repeat(f.rating)}{"☆".repeat(5 - f.rating)}</span>
                      <small style={{ color:"#94a3b8" }}>{f.reviewerName}</small>
                    </div>
                    <p style={{ margin:"8px 0", fontSize:"13px", color:"#334155" }}>{f.comment}</p>

                    {f.reply?.text ? (
                      <div style={{ background:"#f8fafc", borderLeft:"3px solid #2563eb", padding:"8px 12px", borderRadius:"6px", fontSize:"12px" }}>
                        <strong>Your Reply:</strong> {f.reply.text}
                      </div>
                    ) : (
                      <div style={{ display:"flex", gap:"8px", marginTop:"8px" }}>
                        <input
                          type="text"
                          placeholder="Write a reply..."
                          value={replyDrafts[f._id] || ""}
                          onChange={(e) => handleReplyChange(f._id, e.target.value)}
                          style={{ flex:1, padding:"6px 10px", borderRadius:"6px", border:"1px solid #e2e8f0", fontSize:"12px" }}
                        />
                        <button
                          onClick={() => handleReplySubmit(f._id)}
                          disabled={replySubmitting === f._id}
                          style={{ padding:"6px 14px", borderRadius:"6px", border:"none", background:"#2563eb", color:"white", fontSize:"12px", cursor:"pointer" }}
                        >
                          {replySubmitting === f._id ? "..." : "Reply"}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
