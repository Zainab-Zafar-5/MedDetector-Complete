import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Building2, Users } from 'lucide-react';
import styles from './AdminDashboard.module.css'; // same design tokens reuse ho rahe hain

const AdminFeedback = () => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  const fetchFeedback = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/feedback/admin');
      const json = await res.json();
      if (json.success) setFeedback(json.data);
    } catch (err) {
      console.error("Failed to fetch feedback:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFeedback(); }, []);

  const visible = useMemo(() => {
    if (filter === 'All') return feedback;
    return feedback.filter(f => f.type === filter.toLowerCase());
  }, [feedback, filter]);

  if (loading) {
    return (
      <div className={styles.adminContainer}>
        <div className={styles.header}>
          <div>
            <h1>Feedback Overview</h1>
            <p>All pharmacy reviews and website feedback</p>
          </div>
          <Link to="/admin/dashboard" className={styles.logBtn} style={{ textDecoration: 'none' }}>
            <Users size={16} /> Partners
          </Link>
        </div>
        <div className={styles.skeletonTable} />
      </div>
    );
  }

  return (
    <div className={styles.adminContainer}>
      <div className={styles.header}>
        <div>
          <h1>Feedback Overview</h1>
          <p>All pharmacy reviews and website feedback</p>
        </div>
        <Link to="/admin/dashboard" className={styles.logBtn} style={{ textDecoration: 'none' }}>
          <Users size={16} /> Partners
        </Link>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.filterTabs}>
          {['All', 'Pharmacy', 'Website'].map(f => (
            <button
              key={f}
              className={`${styles.filterTab} ${filter === f ? styles.filterTabActive : ''}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.tableWrapper}>
        {visible.length === 0 ? (
          <div className={styles.emptyState}>
            <MessageSquare size={32} />
            <p>No Feedback .</p>
            <span>Try a different filter.</span>
          </div>
        ) : (
          <table className={styles.partnerTable}>
            <thead>
              <tr>
                <th>Type</th>
                <th>Pharmacy</th>
                <th>Reviewer</th>
                <th>Rating</th>
                <th>Comment</th>
                <th>Reply Status</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((f) => (
                <tr key={f._id}>
                  <td>
                    {f.type === 'pharmacy'
                      ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Building2 size={14} /> Pharmacy</span>
                      : 'Website'}
                  </td>
                  <td>{f.pharmacyName || '—'}</td>
                  <td>
                    <div>{f.reviewerName}</div>
                    <small>{f.reviewerEmail}</small>
                  </td>
                  <td>{'★'.repeat(f.rating)}{'☆'.repeat(5 - f.rating)}</td>
                  <td style={{ maxWidth: 260 }}>{f.comment}</td>
                  <td>
                    {f.reply?.text
                      ? <span className={`${styles.statusBadge} ${styles.approved}`}><span className={styles.statusDot} />Replied</span>
                      : <span className={`${styles.statusBadge} ${styles.pending}`}><span className={styles.statusDot} />Pending</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminFeedback;
