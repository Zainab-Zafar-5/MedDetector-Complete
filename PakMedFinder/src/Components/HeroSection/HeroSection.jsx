import React, { useState } from 'react'
import styles from './HeroSection.module.css'
import { useNavigate } from 'react-router-dom'

export default function HeroSection({
  title,
  subtitle,
  ctaPrimary,
  ctaSecondary,
  note,
  imageUrl,
}) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState(""); // User input ke liye state

  const handleSearchClick = (e) => {
    if (e) e.preventDefault();
    
    if (ctaPrimary?.onClick) {
      ctaPrimary.onClick();
    } else {
      // Input se query utha kar Search Results page par bhejna
      const query = searchTerm.trim();
      if (query) {
        // EncodeURIComponent use kiya hai taake special characters URL mein masla na karein
        navigate(`/search-results?q=${encodeURIComponent(query)}`);
      } else {
        navigate('/search-results');
      }
    }
  };

  return (
    <section className={styles.hero}>
      <div className={styles.content}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.subtitle}>{subtitle}</p>

        <div className={styles.ctaRow}>
          {/* Backend Connection ke liye Search Input Area */}
          <div className={styles.searchWrapper} style={{ marginBottom: '15px', width: '100%' }}>
            <input 
              type="text"
              placeholder="Search 50,000+ medicines..."
              className={styles.heroInput} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearchClick()}
              style={{
                padding: '12px 20px',
                borderRadius: '12px',
                border: '2px solid #e2e8f0',
                width: '100%',
                maxWidth: '450px',
                outline: 'none',
                fontSize: '1rem'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              className={styles.primaryBtn}
              type="button"
              onClick={handleSearchClick}
            >
              {ctaPrimary?.label || "Search Medicine"}
            </button>

            <button
              className={styles.secondaryBtn}
              type="button"
              onClick={() => navigate('/shortage-map')}
            >
              {ctaSecondary?.label || "View Shortage Map"}
            </button>
          </div>
        </div>

        {note && <p className={styles.note}>{note}</p>}
      </div>

      <div className={styles.visual}>
        {imageUrl ? (
          <img src={imageUrl} alt="Hero visual" className={styles.visualImg} />
        ) : (
          <div className={styles.placeholder}>
             <div className={styles.statusBadge}>99.8% Sync Accuracy</div>
          </div>
        )}
      </div>
    </section>
  )
}