import React from 'react';
import { useParams, Link } from 'react-router-dom';
import styles from './PartnerDetailsPage.module.css';
import { FaArrowLeft, FaCheckCircle } from 'react-icons/fa';

const partnerDetailsData = {
  1: {
    title: "Market Expansion & Revenue Growth",
    detail: "Break the geographical barriers of your local storefront. MedDetector's digital network broadcasts your live inventory to thousands of patients city-wide.",
    benefits: [
      "City-wide visibility to targeted customer segments",
      "Significant increase in verified walk-in traffic",
      "Zero-cost lead generation for niche medications"
    ],
    stats: { l1: "New Customers", v1: "+1,240", l2: "Revenue Lift", v2: "+22%", l3: "Search Rank", v3: "#1" },
    chartColor: "#10b981", // Green for growth
    bars: [40, 70, 50, 90, 100]
  },
  2: {
    title: "Seamless POS & Inventory Integration",
    detail: "Modernize your operations with our direct integration protocols. Our system syncs with your existing Point of Sale (POS) and inventory management software.",
    benefits: [
      "Real-time synchronization with industry-leading POS software",
      "99.9% data accuracy with automated stock reporting",
      "Reduction in administrative overhead and labor costs"
    ],
    stats: { l1: "SKUs Synced", v1: "14,250", l2: "Data Accuracy", v2: "99.9%", l3: "Manual Errors", v3: "0" },
    chartColor: "#3b82f6", // Blue for tech/system
    bars: [80, 85, 90, 95, 100]
  },
  3: {
    title: "AI-Powered Demand Forecasting",
    detail: "Transition from reactive ordering to proactive inventory management. Our advanced AI engine analyzes market trends and national supply chain disruptions.",
    benefits: [
      "Machine learning-driven demand forecasting",
      "Early alerts for national and local medicine shortages",
      "Optimization of capital by reducing overstock"
    ],
    stats: { l1: "Predicted Shortage", v1: "12 Items", l2: "AI Confidence", v2: "97%", l3: "Risk Level", v3: "Low" },
    chartColor: "#facc15", // Yellow for AI/Alerts
    bars: [30, 50, 20, 80, 40]
  }
};

function PartnerDetailsPage() {
  const { id } = useParams();
  const detail = partnerDetailsData[id];

  if (!detail) {
    return (
      <div className={styles.errorContainer}>
        <h1>404 - Benefit Not Found</h1>
        <Link to="/why-us" className={styles.backButton}><FaArrowLeft /> Return to Overview</Link>
      </div>
    );
  }

  return (
    <section className={styles.detailsPage}>
      <Link to="/why-us" className={styles.backButton}>
          <FaArrowLeft /> Back to Partner Benefits
      </Link>
      
      <header className={styles.header}>
          <h1 className={styles.mainTitle}>{detail.title}</h1>
          <p className={styles.detailText}>{detail.detail}</p>
      </header>
      
      <div className={styles.visualPlaceholder}>
          <div className={styles.mockupContainer}>
              <div className={styles.mockupHeader}>
                  <span className={styles.statusDot}></span>
                  <strong>Live System Analysis</strong>
              </div>
              <div className={styles.mockupStats}>
                  <div className={styles.statItem}>
                      <span>{detail.stats.l1}</span>
                      <h3>{detail.stats.v1}</h3>
                  </div>
                  <div className={styles.statItem}>
                      <span>{detail.stats.l2}</span>
                      <h3>{detail.stats.v2}</h3>
                  </div>
                  <div className={styles.statItem}>
                      <span>{detail.stats.l3}</span>
                      <h3 style={{color: detail.chartColor}}>{detail.stats.v3}</h3>
                  </div>
              </div>
              <div className={styles.mockupGraph}>
                  {detail.bars.map((h, i) => (
                      <div key={i} className={styles.graphBar} style={{height: `${h}%`, backgroundColor: detail.chartColor}}></div>
                  ))}
              </div>
          </div>
      </div>
      
      <div className={styles.benefitsSection}>
          <h2>Key Institutional Benefits</h2>
          <div className={styles.benefitGrid}>
              {detail.benefits.map((benefit, index) => (
                  <div key={index} className={styles.benefitItem}>
                      <FaCheckCircle className={styles.checkIcon} style={{color: detail.chartColor}} />
                      <p>{benefit}</p>
                  </div>
              ))}
          </div>
      </div>
      
      <div className={styles.finalCta}>
          <Link to="/partner-register" className={styles.registerButton}>
              Join the Partnership Network
          </Link>
      </div>
    </section>
  );
}

export default PartnerDetailsPage;