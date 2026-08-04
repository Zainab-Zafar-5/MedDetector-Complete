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
  {/* Integrated Search Bar */}
  <div className={styles.searchBar}>
    <span className={styles.searchIcon}>🔍</span>
    <input
      type="text"
      placeholder="Search 50,000+ medicines... e.g. Panadol"
      className={styles.heroInput}
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      onKeyPress={(e) => e.key === 'Enter' && handleSearchClick()}
    />
    <button
      className={styles.searchInlineBtn}
      type="button"
      onClick={handleSearchClick}
    >
      Search
    </button>
  </div>

  {/* Secondary Button alag row mein */}
  <button
  className={styles.secondaryBtn}
  type="button"
  onClick={() => navigate('/shortage-map')}
>
  {ctaSecondary?.label || "View Shortage Map"}
</button>

<button
  className={styles.loginBtn}
  type="button"
  onClick={() => navigate('/login')}
>
 Partner Login
</button>
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