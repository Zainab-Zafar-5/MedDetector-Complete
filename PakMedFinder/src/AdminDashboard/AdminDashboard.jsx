import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Clock, Building2 } from 'lucide-react';
import styles from './AdminDashboard.module.css';

const AdminDashboard = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch all partners from Backend
  const fetchPartners = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/partners');
      const json = await response.json();
      if (json.success) setPartners(json.data);
    } catch (err) {
      console.error("Failed to fetch:", err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Function to Approve or Reject
  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/partners/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const result = await response.json();
      if (result.success) {
        alert(`Pharmacy ${newStatus} Successfully!`);
        fetchPartners(); // Refresh list to show updated status
      }
    } catch (err) {
      alert("Status update failed");
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  if (loading) return <div className={styles.loader}>Loading Dashboard...</div>;

  return (
    <div className={styles.adminContainer}>
      <div className={styles.header}>
        <h1>Admin Partner Management</h1>
        <p>Review and verify pharmacy applications</p>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.partnerTable}>
          <thead>
            <tr>
              <th>Pharmacy Name</th>
              <th>Owner & Contact</th>
              <th>Location</th>
              <th>Current Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {partners.map((p) => (
              <tr key={p._id}>
                <td>
                  <div className={styles.pharmacyName}>
                    <Building2 size={18} />
                    <strong>{p.pharmacyName}</strong>
                  </div>
                </td>
                <td>
                  <div>{p.ownerName}</div>
                  <small>{p.email}</small>
                </td>
                <td>{p.city}</td>
                <td>
                  <span className={`${styles.statusBadge} ${styles[p.status.toLowerCase()]}`}>
                    {p.status}
                  </span>
                </td>
                <td className={styles.actionButtons}>
                  {p.status === 'Pending' && (
                    <>
                      <button 
                        className={styles.approveBtn} 
                        onClick={() => handleStatusUpdate(p._id, 'Approved')}
                      >
                        <CheckCircle size={16} /> Approve
                      </button>
                      <button 
                        className={styles.rejectBtn} 
                        onClick={() => handleStatusUpdate(p._id, 'Rejected')}
                      >
                        <XCircle size={16} /> Reject
                      </button>
                    </>
                  )}
                  {p.status !== 'Pending' && <span className={styles.completedText}>Processed</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;