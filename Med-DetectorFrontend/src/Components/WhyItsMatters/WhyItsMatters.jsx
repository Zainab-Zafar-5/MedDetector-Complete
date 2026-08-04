// src/components/HomePageContent.jsx
import React from "react";
import styles from "./WhyItsMatters.module.css";

const WhyItsMatters = () => {
  return (
    <section className={styles.homeContainer}>
      <div className={styles.titleSection}>
        <h1>Automating Efficiency with n8n</h1>
        <p>
          MedConnect leverages the power of n8n to streamline operations and
          ensure timely, accurate data flow.
        </p>
      </div>

      <div className={styles.arrowsSection}>
        <div className={`${styles.arrow} ${styles.arrow1}`}>Google Sheets / APIs</div>
        <div className={`${styles.arrow} ${styles.arrow2}`}>n8n Automation</div>
        <div className={`${styles.arrow} ${styles.arrow3}`}>Notifications</div>
      </div>

      <div className={styles.featuresSection}>
        <div className={styles.feature}>
          <span className={styles.bullet} style={{ background: "#f2c94c" }}></span>
          <div>
            <h3>Auto-fetch Pharmacy Stock</h3>
            <p>
              Seamlessly pulls inventory data via Google Sheets and various APIs,
              reducing manual entry.
            </p>
          </div>
        </div>

        <div className={styles.feature}>
          <span className={styles.bullet} style={{ background: "#eb5757" }}></span>
          <div>
            <h3>Automatic Low Inventory Alerts</h3>
            <p>
              Proactive notifications ensure pharmacies are always aware of critical stock levels.
            </p>
          </div>
        </div>

        <div className={styles.feature}>
          <span className={styles.bullet} style={{ background: "#56ccf2" }}></span>
          <div>
            <h3>Weekly Shortage Analytics</h3>
            <p>
              Generates regular reports to identify trends and inform strategic decisions for healthcare providers.
            </p>
          </div>
        </div>

        <div className={styles.feature}>
          <span className={styles.bullet} style={{ background: "#6fcf97" }}></span>
          <div>
            <h3>Integration with Communication Channels</h3>
            <p>
              Delivers vital updates and alerts directly to users and pharmacies via SMS, WhatsApp, and email.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyItsMatters;
