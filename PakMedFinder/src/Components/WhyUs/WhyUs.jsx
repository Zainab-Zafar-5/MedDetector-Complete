import React from 'react';
import styles from './WhyUs.module.css';
import { Link } from 'react-router-dom';
import { FaRegChartBar, FaHourglassHalf, FaPills, FaHandshake } from 'react-icons/fa';

function WhyUs() {
    // Professional English-only content with minimal card text
    const valueProps = [
        {
            icon: FaRegChartBar,
            title: "Expand Market Reach",
            summary: "Connect your pharmacy with thousands of patients across the city searching for medicine."
        },
        {
            icon: FaHourglassHalf,
            title: "Automated Inventory",
            summary: "Eliminate manual reporting with seamless integration with your existing POS system."
        },
        {
            icon: FaPills,
            title: "Smart Stock Alerts",
            summary: "Receive AI-powered notifications before critical medicines go out of stock."
        },
    ];

    return (
        <section className={styles.whyUsPage}>
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Why Partner with MedDetector?</h1>
                {/* FIXED: Removed raw markdown stars and made it clean English */}
                <p className={styles.pageSubtitle}>
                    Maximize Revenue, Optimize Inventory, and Serve Your Community Better.
                </p>
            </div>

            <div className={styles.propsContainer}>
                {valueProps.map((prop, index) => (
                    <div key={index} className={styles.propCard}>
                        <prop.icon className={styles.propIcon} />
                        <h3 className={styles.propTitle}>{prop.title}</h3>
                        <p className={styles.summaryText}>{prop.summary}</p>
                        
                        <Link to={`/partner-details/${index + 1}`} className={styles.learnMore}>
                            Read Details →
                        </Link>
                    </div>
                ))}
            </div>

            <div className={styles.finalCta}>
                <h2>Ready to Join Pakistan's Largest Pharmacy Network?</h2>
                <p>Register today to increase your digital presence and operational efficiency.</p>
                <Link to="/partner-register" className={styles.ctaButton}>
                    <FaHandshake /> Register as a Partner
                </Link>
            </div>
            
        </section>
    );
}

export default WhyUs;