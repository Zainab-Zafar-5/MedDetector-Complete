import React from 'react';
import styles from './StatsSection.module.css';
// Icons from React Icons library (Fa, Io, Md, Ai, etc.)
import { FaStore, FaSyncAlt, FaMapMarkerAlt, FaShieldAlt } from 'react-icons/fa'; 

function StatsSection() {
  const statsData = [
    { number: "500+", label: "Pharmacy Partners", icon: <FaStore size={40} /> },
    { number: "10,000+", label: "Daily Stock Updates", icon: <FaSyncAlt size={40} /> },
    { number: "20+", label: "Cities Covered", icon: <FaMapMarkerAlt size={40} /> },
    { number: "99%", label: "Data Reliability", icon: <FaShieldAlt size={40} /> },
  ];

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.heading}>Trusted by the Community</h2>
        
        <div className={styles.statsGrid}>
          {statsData.map((stat, index) => (
            <div key={index} className={styles.statItem}>
              <div className={styles.icon}>{stat.icon}</div>
              <p className={styles.number}>{stat.number}</p>
              <p className={styles.label}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default StatsSection;