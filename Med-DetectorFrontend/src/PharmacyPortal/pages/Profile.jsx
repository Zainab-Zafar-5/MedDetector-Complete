import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { getProfile } from "../../api";

const Profile = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await getProfile();
        if (res?.data?.success) {
          setProfileData(res.data.data);
          const currentUser = JSON.parse(localStorage.getItem("user")) || {};
          const updatedUser = { ...currentUser, pharmacyName: res.data.data.pharmacyName, licenseNo: res.data.data.licenseNo };
          localStorage.setItem("user", JSON.stringify(updatedUser));
        } else if (res?.data) {
          setProfileData(res.data);
        } else {
          setProfileData(res);
        }
      } catch (err) {
        console.error("Profile Load Error:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return (
    <div style={{ display: "flex" }}><Sidebar /><div className="main-content"><Navbar /><div style={{ textAlign:"center", marginTop:"20%" }}>⏳ Fetching Live Profile Context...</div></div></div>
  );

  const data = profileData || {};

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <div className="main-content" style={{ flex: 1, marginLeft: "var(--sidebar-w)" }}>
        <Navbar />
        <div className="page-content" style={{ padding: "30px" }}>
          <h2>My Profile</h2>
          <p>Manage your account and pharmacy info</p>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "20px" }}>
            
            {/* 👤 PERSONAL INFO CARD */}
            <div className="card" style={{ padding: "20px", background: "white", borderRadius: "12px" }}>
              <h3>👤 Personal Info</h3>
              <div style={{ marginTop: "10px" }}>
                <label style={{ fontSize: "12px", color: "#64748b" }}>FULL NAME</label>
                <input value={data.ownerName || "Pharmacy Owner"} readOnly style={{ width: "100%", padding: "8px", marginTop: "4px" }} />
              </div>
              <div style={{ marginTop: "10px" }}>
                <label style={{ fontSize: "12px", color: "#64748b" }}>EMAIL</label>
                <input value={data.email || ""} readOnly style={{ width: "100%", padding: "8px", marginTop: "4px" }} />
              </div>
              <div style={{ marginTop: "10px" }}>
                <label style={{ fontSize: "12px", color: "#64748b" }}>PHONE</label>
                <input value={data.phone || "—"} readOnly style={{ width: "100%", padding: "8px", marginTop: "4px" }} />
              </div>
            </div>

            {/* 🏥 PHARMACY INFO CARD */}
            <div className="card" style={{ padding: "20px", background: "white", borderRadius: "12px" }}>
              <h3>🏥 Pharmacy Info</h3>
              <div style={{ marginTop: "10px" }}>
                <label style={{ fontSize: "12px", color: "#64748b" }}>PHARMACY NAME</label>
                <input value={data.pharmacyName || ""} readOnly style={{ width: "100%", padding: "8px", marginTop: "4px", fontWeight: "bold" }} />
              </div>
              <div style={{ marginTop: "10px" }}>
                <label style={{ fontSize: "12px", color: "#64748b" }}>LOCATION / ADDRESS</label>
                <input value={data.address || data.city || "—"} readOnly style={{ width: "100%", padding: "8px", marginTop: "4px" }} />
              </div>
              <div style={{ marginTop: "10px" }}>
                <label style={{ fontSize: "12px", color: "#64748b" }}>LICENSE NUMBER (LOCKED 🔒)</label>
                <input value={data.licenseNo || ""} readOnly style={{ width: "100%", padding: "8px", marginTop: "4px" }} />
              </div>
              <div style={{ marginTop: "10px" }}>
                <label style={{ fontSize: "12px", color: "#64748b" }}>SYSTEM ROLE</label>
                <input value={data.status === "Approved" ? "Pharmacy Partner" : "Pharmacy Owner"} readOnly style={{ width: "100%", padding: "8px", marginTop: "4px" }} />
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;