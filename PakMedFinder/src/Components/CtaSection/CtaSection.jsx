import React from 'react';
import styles from './CtaSection.module.css';

function CTASection() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        {/* Main Headline (Same, ye theek hai) */}
        <h2 className={styles.heading}>
          Stop Worrying. Start Finding.
        </h2>
        {/* Supporting Text (Web focus) */}
        <p className={styles.subtext}>
          Join Pakistan's first real-time medicine tracking network today and start searching instantly.
        </p>

        {/* Action Buttons */}
        <div className={styles.actions}>
          {/* Primary Button: Search Medicine (Hero se match karta hai) */}
          <button className={`${styles.button} ${styles.primaryButton}`}>
            Search Medicine Now
          </button>
          
          {/* Secondary Button: Instead of Download, we offer another action */}
          <button className={`${styles.button} ${styles.secondaryButton}`}>
            View Shortage Heatmap
          </button>
        </div>
      </div>
    </section>
  );
}

export default CTASection;