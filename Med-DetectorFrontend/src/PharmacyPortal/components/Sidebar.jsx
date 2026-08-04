import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Pill, 
  FileText, 
  CalendarCheck, 
  User, 
  LogOut,
  ClipboardList 
} from "lucide-react";
const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  // Local storage se data fetch karna
  const userObj = JSON.parse(localStorage.getItem("user")) || {};
  const dynamicPharmacyName = userObj.pharmacyName || userObj.name || "MedDetector Partner"; 
  const userRole = localStorage.getItem("userRole") || "USER";
  
  const requests     = JSON.parse(localStorage.getItem("requests"))     || [];
  const reservations = JSON.parse(localStorage.getItem("reservations")) || [];
  
  const initial = dynamicPharmacyName.charAt(0).toUpperCase();
  
  const handleLogout = () => {
  // Clear specific items to avoid cache corruption
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  navigate("/login");
};

  return (
    <div className="sidebar" style={{
      width: "260px",
      height: "100vh",
      background: "#0f172a",
      color: "white",
      position: "fixed",
      left: 0,
      top: 0,
      display: "flex",
      flexDirection: "column",
      borderRight: "1px solid #1e293b",
      zIndex: 100
    }}>
      {/* HEADER */}
      <div style={{ padding: "24px", display: "flex", alignItems: "center", gap: "12px", borderBottom: "1px solid #1e293b" }}>
        <div style={{ background: "#2563eb", padding: "8px", borderRadius: "8px" }}>
          <Pill size={22} color="white" />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "bold" }}>MedDetector</h3>
          <span style={{ fontSize: "11px", color: "#38bdf8", fontWeight: "600", textTransform: "uppercase" }}>
            {userRole.replace("_", " ")}
          </span>
        </div>
      </div>

      {/* NAVIGATION LINKS */}
      <div style={{ flex: 1, padding: "20px 12px", display: "flex", flexDirection: "column", gap: "6px" }}>
        <span style={{ fontSize: "10px", color: "#64748b", fontWeight: "700", paddingLeft: "12px", marginBottom: "6px" }}>MAIN</span>
        
        <div onClick={() => navigate("/pharmacy/dashboard")} style={{ cursor: "pointer", padding: "10px", borderRadius: "8px", display: "flex", alignItems: "center", gap: "10px", background: isActive("/pharmacy/dashboard") ? "#1e293b" : "transparent" }}>
          <LayoutDashboard size={18} /> Dashboard
        </div>

        <div onClick={() => navigate("/pharmacy/medicines")} style={{ cursor: "pointer", padding: "10px", borderRadius: "8px", display: "flex", alignItems: "center", gap: "10px", background: isActive("/pharmacy/medicines") ? "#1e293b" : "transparent" }}>
          <Pill size={18} /> Medicines
        </div>

        <span style={{ fontSize: "10px", color: "#64748b", fontWeight: "700", paddingLeft: "12px", marginTop: "15px", marginBottom: "6px" }}>OPERATIONS</span>

        <div onClick={() => navigate("/pharmacy/requests")} style={{ cursor: "pointer", padding: "10px", borderRadius: "8px", display: "flex", alignItems: "center", gap: "10px", background: isActive("/pharmacy/requests") ? "#1e293b" : "transparent" }}>
          <FileText size={18} /> Requests
        </div>

        <div onClick={() => navigate("/pharmacy/reservations")} style={{ cursor: "pointer", padding: "10px", borderRadius: "8px", display: "flex", alignItems: "center", gap: "10px", background: isActive("/pharmacy/reservations") ? "#1e293b" : "transparent" }}>
          <CalendarCheck size={18} /> Reservations
        </div>
        {/* Prescriptions Link */}
<div onClick={() => navigate("/pharmacy/prescriptions")} style={{ cursor: "pointer", padding: "10px", borderRadius: "8px", display: "flex", alignItems: "center", gap: "10px", background: isActive("/pharmacy/prescriptions") ? "#1e293b" : "transparent", transition: "background 0.2s" }}>
  <ClipboardList size={18} /> Verify Prescriptions
</div>

        {/* PROFILE LINK WAPAS ADD KAR DIYA HAI */}
        <span style={{ fontSize: "10px", color: "#64748b", fontWeight: "700", paddingLeft: "12px", marginTop: "15px", marginBottom: "6px" }}>ACCOUNT</span>
        
        <div onClick={() => navigate("/pharmacy/profile")} style={{ cursor: "pointer", padding: "10px", borderRadius: "8px", display: "flex", alignItems: "center", gap: "10px", background: isActive("/pharmacy/profile") ? "#1e293b" : "transparent" }}>
          <User size={18} /> Profile
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ padding: "16px", borderTop: "1px solid #1e293b", background: "#0b1329" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
          <div style={{ width: "36px", height: "36px", background: "#3b82f6", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
            {initial}
          </div>
          <div style={{ overflow: "hidden" }}>
            <h4 style={{ margin: 0, fontSize: "13px" }}>{dynamicPharmacyName}</h4>
            <p style={{ margin: 0, fontSize: "11px", color: "#64748b" }}>{userObj.email}</p>
          </div>
        </div>
        <button onClick={handleLogout} style={{ width: "100%", padding: "8px", background: "#1e293b", color: "#f87171", border: "1px solid #7f1d1d", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
          <LogOut size={14} /> Log Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;