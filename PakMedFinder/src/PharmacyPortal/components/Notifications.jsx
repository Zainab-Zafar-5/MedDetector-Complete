import React from "react";

const Notifications = () => {
  const medicines    = JSON.parse(localStorage.getItem("medicines"))    || [];
  const requests     = JSON.parse(localStorage.getItem("requests"))     || [];
  const reservations = JSON.parse(localStorage.getItem("reservations")) || [];

  const lowStock = medicines.filter(m => m.stock < 20);

  const notifications = [
    ...lowStock.map(m => ({
      type:"warn", icon:"⚠️",
      text:`${m.name} is low on stock (${m.stock} units)`,
      time:"Needs attention"
    })),
    ...(requests.length ? [{
      type:"info", icon:"📋",
      text:`${requests.length} pending request(s)`,
      time:"Today"
    }] : []),
    ...(reservations.length ? [{
      type:"success", icon:"📅",
      text:`${reservations.length} reservation(s) scheduled`,
      time:"Upcoming"
    }] : []),
    ...(!lowStock.length && !requests.length && !reservations.length ? [{
      type:"success", icon:"✅",
      text:"All systems normal — no alerts",
      time:"Just now"
    }] : []),
  ];

  const styles = {
    warn:    { border:"var(--red)",   bg:"#fff5f5" },
    info:    { border:"var(--blue)",  bg:"#eff6ff" },
    success: { border:"var(--green)", bg:"#f0fdf4" },
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">🔔 Notifications</div>
        <span className="badge badge-red">{lowStock.length || "✓"}</span>
      </div>
      <div className="card-body">
        <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
          {notifications.map((n, i) => (
            <div key={i} style={{
              display:"flex", alignItems:"flex-start", gap:"10px",
              padding:"12px",
              borderRadius:"10px",
              background: styles[n.type].bg,
              borderLeft:`3px solid ${styles[n.type].border}`,
              transition:"transform 0.15s"
            }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateX(3px)"}
              onMouseLeave={e => e.currentTarget.style.transform = "translateX(0)"}
            >
              <span style={{ fontSize:"18px" }}>{n.icon}</span>
              <div>
                <div style={{ fontSize:"13px", fontWeight:"500" }}>{n.text}</div>
                <div style={{ fontSize:"11px", color:"var(--text-muted)", marginTop:"2px" }}>
                  {n.time}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Notifications;