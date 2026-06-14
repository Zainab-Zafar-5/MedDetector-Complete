import React from "react";
// Make sure icons installed hain, nahi to purane icons use karein
import { FaSearch, FaBell, FaSyncAlt, FaLayerGroup } from "react-icons/fa"; 
import styles from "./FeaturesSection.module.css";

function FeatureCard({ icon, title, text, variant }) {
  // Combine styles: .featureItem + .yellow/.red/etc
  return (
    <article className={`${styles.featureItem} ${styles[variant]}`}>
      <div className={styles.iconWrapper}>
        {icon}
      </div>

      <div>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.text}>{text}</p>
      </div>
    </article>
  );
}

export default function FeaturesSection() {
  const features = [
    {
      title: "Find Nearby Pharmacies",
      text: "Locate the nearest pharmacies instantly and check live availability of your required medicines.",
      icon: <FaSearch />, 
      variant: "yellow" // Yellow Box
    },
    {
      title: "Notify Alert",
      text: "Get real-time notifications when out-of-stock medicines become available nearby.",
      icon: <FaBell />, 
      variant: "red" // Red Box
    },
    {
      title: "Stock Update",
      text: "Pharmacies can quickly update stock levels to keep the database current.",
      icon: <FaSyncAlt />, 
      variant: "blue" // Blue Box
    },
    {
      title: "Check Alternatives",
      text: "Discover safe medical alternatives and generics if your specific brand is unavailable.",
      icon: <FaLayerGroup />, 
      variant: "green" // Green Box
    }
  ];

  return (
    <section id="features" className={styles.section}>
      {/* Container to center heading */}
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h2 className={styles.heading}>Our Core Features</h2>

        <div className={styles.grid}>
          {features.map((f, i) => (
            <FeatureCard
              key={i}
              icon={f.icon}
              title={f.title}
              text={f.text}
              variant={f.variant}
            />
          ))}
        </div>
      </div>
    </section>
  );
}