import React, { useState, useEffect } from 'react';
import { Loader2, X } from 'lucide-react';
import styles from './SearchResults.module.css';

const Alternative = ({ medName, genericName, onClose }) => {
    const [alternatives, setAlternatives] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
    const fetchAlt = async () => {
        setLoading(true);
        try {
            console.log("Fetching for:", medName, genericName); // Yeh check karein console mein
            const response = await fetch(`http://localhost:5000/api/alternatives?name=${encodeURIComponent(medName)}&genericName=${encodeURIComponent(genericName)}`);
            const result = await response.json();
            console.log("API Response:", result); // Yeh check karein ke kya data aa raha hai
            setAlternatives(result.data || []);
        } catch (err) {
            console.error("Alt fetch error:", err);
        } finally {
            setLoading(false);
        }
    };
    if (medName) fetchAlt(); // Sirf tabhi fetch karein agar medName ho
}, [medName, genericName]);

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <button className={styles.closeBtnRound} onClick={onClose}><X size={20} /></button>
                <h3>Alternatives for {medName}</h3>
                <div className={styles.modalBody}>
                    {loading ? (
                        <p style={{textAlign: 'center'}}><Loader2 className="animate-spin" /> Searching...</p>
                    ) : alternatives.length > 0 ? (
                        alternatives.map((alt, idx) => (
                            <div key={idx} className={styles.altRow} style={{padding: '10px', borderBottom: '1px solid #eee'}}>
                                <strong>{alt.name}</strong> <br/> 
                                <small>{alt.pharmacyName} | Price: {alt.price}</small>
                            </div>
                        ))
                    ) : (
                        <p style={{textAlign: 'center', color: '#64748b'}}>No alternatives found.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Alternative;