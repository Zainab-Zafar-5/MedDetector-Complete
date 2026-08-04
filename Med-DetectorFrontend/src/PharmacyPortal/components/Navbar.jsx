import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getDashboard, getProfile } from "../../api";

const pageTitles = {
  "/pharmacy/dashboard": ["Dashboard", "Welcome back — here's what's happening today"],
  "/pharmacy/medicines": ["Medicine Inventory", "Manage all medicines and stock levels"],
  "/pharmacy/requests": ["Medicine Requests", "Track and manage patient requests"],
  "/pharmacy/reservations": ["Reservations", "Scheduled medicine reservations"],
  "/pharmacy/profile": ["My Profile", "Manage your account and pharmacy info"],
  "/pharmacy/add-medicine": ["Add Medicine", "Add a new medicine to your inventory"],
};

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const [profile, setProfile] = useState({ name: "Pharmacy Owner" });
  const [notifications, setNotifications] = useState([]);
  const [lowStockCount, setLowStockCount] = useState(0);

  const toggleSidebar = () => {
    const sidebar = document.querySelector(".sidebar");
    if (sidebar) sidebar.classList.toggle("open");
  };

  const closeSidebar = () => {
    const sidebar = document.querySelector(".sidebar");
    if (sidebar) sidebar.classList.remove("open");
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, profRes] = await Promise.all([
          getDashboard(),
          getProfile(),
        ]);

        const profileData =
          profRes?.data?.data ||
          profRes?.data ||
          { name: "Pharmacy Owner" };

        setProfile(profileData);

        const dashboardPayload = dashRes?.data?.data || dashRes?.data;

        setNotifications(dashboardPayload?.notifications || []);
        setLowStockCount(dashboardPayload?.cards?.lowStock || 0);
      } catch (err) {
        console.error("Navbar fetch error:", err.message);
      }
    };

    fetchData();
  }, [location.pathname]);

  const initial = (profile?.name?.charAt(0) || "A").toUpperCase();
  const firstName = profile?.name?.split(" ")[0] || "User";

  const [title, subtitle] =
    pageTitles[location.pathname] || ["Dashboard", ""];

  const notifColors = {
    warn: { border: "var(--red)", bg: "var(--red-light)" },
    info: { border: "var(--blue)", bg: "var(--blue-light)" },
    success: { border: "var(--green)", bg: "var(--green-light)" },
  };

  return (
    <div
      style={{
        background: "white",
        borderBottom: "1px solid var(--border)",
        padding: "0 32px",
        height: "64px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      {/* Overlay */}
      <div className="sidebar-overlay" onClick={closeSidebar} />

      {/* Left */}
      <div>
        <h2 style={{ fontSize: "20px", fontWeight: "700" }}>{title}</h2>
        <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
          {subtitle}
        </p>

        <button className="hamburger-btn" onClick={toggleSidebar}>
          ☰
        </button>
      </div>

      {/* Right */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {/* Notifications */}
        <div style={{ position: "relative" }}>
          <div
            onClick={() => {
              setShowNotif(!showNotif);
              setShowProfile(false);
            }}
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "10px",
              border: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              position: "relative",
            }}
          >
            🔔
            {lowStockCount > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: "7px",
                  right: "7px",
                  width: "8px",
                  height: "8px",
                  background: "var(--red)",
                  borderRadius: "50%",
                }}
              />
            )}
          </div>

          {showNotif && (
            <div
              style={{
                position: "absolute",
                top: "48px",
                right: 0,
                width: "300px",
                background: "white",
                borderRadius: "14px",
                boxShadow: "var(--shadow-lg)",
                border: "1px solid var(--border)",
              }}
            >
              <div style={{ padding: "14px", fontWeight: "700" }}>
                Notifications
              </div>

              <div style={{ padding: "12px" }}>
                {notifications.map((n, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "10px",
                      borderRadius: "10px",
                      background: notifColors[n.type]?.bg || "#f9f9f9",
                      borderLeft: `3px solid ${
                        notifColors[n.type]?.border || "#ccc"
                      }`,
                      marginBottom: "8px",
                    }}
                  >
                    {n.icon} {n.text}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div style={{ position: "relative" }}>
          <div
            onClick={() => {
              setShowProfile(!showProfile);
              setShowNotif(false);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 12px",
              border: "1px solid var(--border)",
              borderRadius: "10px",
              cursor: "pointer",
            }}
          >
            <div
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "8px",
                background: "var(--gold)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "700",
              }}
            >
              {initial}
            </div>

            <span style={{ fontSize: "13px", fontWeight: "600" }}>
              {firstName}
            </span>
          </div>

          {showProfile && (
            <div
              style={{
                position: "absolute",
                top: "48px",
                right: 0,
                width: "200px",
                background: "white",
                borderRadius: "14px",
                boxShadow: "var(--shadow-lg)",
              }}
            >
              <div
                onClick={() => {
                  navigate("/dashboard/profile");
                  setShowProfile(false);
                }}
                style={{ padding: "10px", cursor: "pointer" }}
              >
                👤 Profile
              </div>

              <div
                onClick={() => {
                  localStorage.clear();
                  navigate("/");
                }}
                style={{ padding: "10px", cursor: "pointer", color: "red" }}
              >
                🚪 Logout
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;