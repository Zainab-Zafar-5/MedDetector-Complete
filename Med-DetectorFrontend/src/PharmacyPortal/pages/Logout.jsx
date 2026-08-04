import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../api";

const Logout = () => {
  const navigate = useNavigate();
  const [form,    setForm]    = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      setError("Please enter email and password");
      return;
    }
    try {
      setLoading(true);
      setError("");
      const res = await login(form);
      localStorage.setItem("token", res.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  // Allow login with Enter key
  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "DM Sans, Arial, sans-serif",
      padding: "20px",
    }}>

      {/* Glow effects */}
      <div style={{ position:"fixed", top:"-100px", left:"-100px", width:"400px", height:"400px", background:"radial-gradient(circle,rgba(244,185,66,0.08) 0%,transparent 70%)", borderRadius:"50%", pointerEvents:"none" }}/>
      <div style={{ position:"fixed", bottom:"-100px", right:"-100px", width:"400px", height:"400px", background:"radial-gradient(circle,rgba(37,99,235,0.08) 0%,transparent 70%)", borderRadius:"50%", pointerEvents:"none" }}/>

      <div style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "24px",
        padding: "48px 40px",
        width: "100%",
        maxWidth: "420px",
        backdropFilter: "blur(20px)",
        boxShadow: "0 25px 50px rgba(0,0,0,0.4)",
      }}>

        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:"36px" }}>
          <div style={{
            width: "64px", height: "64px",
            background: "linear-gradient(135deg, #f4b942, #e8931a)",
            borderRadius: "18px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "28px",
            margin: "0 auto 16px",
            boxShadow: "0 8px 24px rgba(244,185,66,0.3)"
          }}>💊</div>
          <h1 style={{ color:"white", fontSize:"26px", fontWeight:"800", margin:"0 0 6px", fontFamily:"Arial,sans-serif" }}>
            Med<span style={{ color:"#f4b942" }}>Detector</span>
          </h1>
          <p style={{ color:"rgba(255,255,255,0.4)", fontSize:"14px", margin:0 }}>
            Sign in to your pharmacy dashboard
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: "12px",
            padding: "12px 16px",
            marginBottom: "20px",
            color: "#fca5a5",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            ❌ {error}
          </div>
        )}

        {/* Form */}
        <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>

          <div>
            <label style={{ color:"rgba(255,255,255,0.6)", fontSize:"13px", fontWeight:"600", display:"block", marginBottom:"8px" }}>
              Email Address
            </label>
            <input
              name="email"
              type="email"
              placeholder="admin@medfinder.com"
              value={form.email}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              style={{
                width: "100%",
                padding: "12px 16px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "12px",
                color: "white",
                fontSize: "14px",
                outline: "none",
                boxSizing: "border-box",
                transition: "border 0.2s",
                fontFamily: "DM Sans, Arial, sans-serif",
              }}
              onFocus={e  => e.target.style.border = "1px solid rgba(244,185,66,0.5)"}
              onBlur={e   => e.target.style.border = "1px solid rgba(255,255,255,0.12)"}
            />
          </div>

          <div>
            <label style={{ color:"rgba(255,255,255,0.6)", fontSize:"13px", fontWeight:"600", display:"block", marginBottom:"8px" }}>
              Password
            </label>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              style={{
                width: "100%",
                padding: "12px 16px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "12px",
                color: "white",
                fontSize: "14px",
                outline: "none",
                boxSizing: "border-box",
                transition: "border 0.2s",
                fontFamily: "DM Sans, Arial, sans-serif",
              }}
              onFocus={e  => e.target.style.border = "1px solid rgba(244,185,66,0.5)"}
              onBlur={e   => e.target.style.border = "1px solid rgba(255,255,255,0.12)"}
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              background: loading
                ? "rgba(244,185,66,0.5)"
                : "linear-gradient(135deg, #f4b942, #e8931a)",
              border: "none",
              borderRadius: "12px",
              color: "#0f172a",
              fontSize: "15px",
              fontWeight: "700",
              cursor: loading ? "not-allowed" : "pointer",
              marginTop: "8px",
              fontFamily: "Arial, sans-serif",
              boxShadow: "0 4px 16px rgba(244,185,66,0.3)",
              transition: "opacity 0.2s",
            }}
            onMouseEnter={e => { if (!loading) e.target.style.opacity = "0.9"; }}
            onMouseLeave={e => { e.target.style.opacity = "1"; }}
          >
            {loading ? "Signing in..." : "🔐 Sign In"}
          </button>
        </div>

        {/* Default credentials hint */}
        <div style={{
          marginTop: "24px",
          padding: "14px 16px",
          background: "rgba(244,185,66,0.06)",
          border: "1px solid rgba(244,185,66,0.15)",
          borderRadius: "12px",
          textAlign: "center"
        }}>
          <div style={{ color:"rgba(255,255,255,0.4)", fontSize:"12px", marginBottom:"6px" }}>Default credentials</div>
          <div style={{ color:"#f4b942", fontSize:"13px", fontWeight:"600" }}>admin@medfinder.com</div>
          <div style={{ color:"rgba(255,255,255,0.5)", fontSize:"13px" }}>admin123</div>
        </div>

      </div>
    </div>
  );
};

export default Logout;