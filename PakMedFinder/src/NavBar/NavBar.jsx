import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import { HashLink } from 'react-router-hash-link'; 
import styles from './NavBar.module.css';
import { FaBars, FaTimes, FaSearch, FaMap } from 'react-icons/fa'; 

function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate(); 

  const toggleMenu = () => { setIsOpen(!isOpen); };
  const closeMenu = () => { setIsOpen(false); };

  const handleSearchClick = () => {
    closeMenu();
    navigate('/search-results'); 
  };

  // Shortage Map par jane ke liye function
  const handleMapClick = () => {
    closeMenu();
    navigate('/shortage-map'); // Yeh aapko naye page par le jayega
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        
        <div className={styles.logo}>
          <Link to="/" onClick={closeMenu}>
            <span className={styles.med}>Med</span>
            <span className={styles.detector}>Detector</span>
          </Link>
        </div>
        
        <button className={styles.menuToggle} onClick={toggleMenu}>
          {isOpen ? <FaTimes className={styles.iconClose} /> : <FaBars className={styles.iconMenu} />}
        </button>

        <div className={`${styles.navContent} ${isOpen ? styles.open : ''}`}>
          <div className={styles.navLinks}>
            <HashLink smooth to="/#features" className={styles.link} onClick={closeMenu}>Features</HashLink>
            <Link to="/why-us" className={styles.link} onClick={closeMenu}>Why Us?</Link>
            <HashLink smooth to="/#faq" className={styles.link} onClick={closeMenu}>FAQ</HashLink>
          </div>

          <div className={styles.ctaButtons}>
            {/* UPDATE: HashLink ko hata kar button ya normal Link use kiya */}
            <button className={styles.reportBtn} onClick={handleMapClick}>
              <FaMap /> View Shortage Map 
            </button>

            <button className={styles.searchBtn} onClick={handleSearchClick}>
              <FaSearch /> Search Medicine
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
