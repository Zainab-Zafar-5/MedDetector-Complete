import React from 'react';
import styles from './Footer.module.css';
// Social Media Icons
import { FaFacebook, FaTwitter, FaLinkedin, FaEnvelope } from 'react-icons/fa'; 

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        
        {/* Column 1: Logo and Description */}
        <div className={styles.column}>
          <h3 className={styles.logo}>MedDetector</h3>
          <p className={styles.description}>
            Pakistan's first real-time medicine tracking network. Solving shortages instantly.
          </p>
          <div className={styles.socialIcons}>
            <FaFacebook className={styles.icon} />
            <FaTwitter className={styles.icon} />
            <FaLinkedin className={styles.icon} />
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div className={styles.column}>
          <h4 className={styles.columnTitle}>Quick Links</h4>
          <ul className={styles.linkList}>
            <li><a href="#features" className={styles.link}>Our Features</a></li>
            <li><a href="#heatmap" className={styles.link}>Shortage Heatmap</a></li>
            <li><a href="#report" className={styles.link}>Report Stock</a></li>
            <li><a href="#contact" className={styles.link}>Contact Us</a></li>
          </ul>
        </div>

        {/* Column 3: Legal & Resources */}
        <div className={styles.column}>
          <h4 className={styles.columnTitle}>Resources</h4>
          <ul className={styles.linkList}>
            <li><a href="#faq" className={styles.link}>FAQs</a></li>
            <li><a href="#privacy" className={styles.link}>Privacy Policy</a></li>
            <li><a href="#terms" className={styles.link}>Terms of Service</a></li>
            <li>
              <FaEnvelope className={styles.contactIcon} /> 
              <span className={styles.link}>support@meddetector.pk</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Footer / Copyright */}
      <div className={styles.copyright}>
        <p>&copy; {new Date().getFullYear()} MedDetector. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;