import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, Building2, Search, Users, PackageCheck, PackageX, AlertCircle, History, X, Ban, RotateCcw, MessageSquare } from 'lucide-react';
import styles from './AdminDashboard.module.css';

const AdminDashboard = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState(null); // { message, type }
  const [updatingId, setUpdatingId] = useState(null);

  // Modal state: { partner, action: 'Approved' | 'Rejected' }
  const [confirmModal, setConfirmModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [detailModal, setDetailModal] = useState(null);

  // Activity log is now derived from partners' statusHistory (persisted in DB)
  const [logOpen, setLogOpen] = useState(false);
  const [logSearchTerm, setLogSearchTerm] = useState('');

  // 1. Fetch all partners from Backend
  const fetchPartners = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/partners');
      const json = await response.json();
      if (json.success) setPartners(json.data);
    } catch (err) {
      console.error("Failed to fetch:", err);
      showToast('Could not load partners. Is the server running?', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // 2. Function to Approve or Reject (called after modal confirmation)
  const handleStatusUpdate = async (id, newStatus, reason = '') => {
    setUpdatingId(id);
    const partner = partners.find(p => p._id === id);
    try {
      const response = await fetch(`http://localhost:5000/api/admin/partners/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          (newStatus === 'Rejected' || newStatus === 'Suspended')
            ? { status: newStatus, rejectionReason: reason }
            : { status: newStatus }
        )
      });
      const result = await response.json();
      if (result.success) {
        const toastType = newStatus === 'Approved' ? 'success' : (newStatus === 'Suspended' ? 'error' : 'reject');
        showToast(`Pharmacy ${newStatus.toLowerCase()} successfully`, toastType);
        fetchPartners(); // Refresh list — this also refreshes the activity log since it's derived from partners
      } else {
        showToast('Status update failed', 'error');
      }
    } catch (err) {
      showToast('Status update failed. Check connection.', 'error');
    } finally {
      setUpdatingId(null);
      setConfirmModal(null);
      setRejectReason('');
    }
  };

  const openConfirm = (partner, action) => {
    setRejectReason('');
    setConfirmModal({ partner, action });
  };

  const submitConfirm = () => {
    if (!confirmModal) return;
    const { partner, action } = confirmModal;
    if ((action === 'Rejected' || action === 'Suspended') && !rejectReason.trim()) {
      showToast(`Please provide a reason for ${action === 'Suspended' ? 'suspension' : 'rejection'}`, 'error');
      return;
    }
    handleStatusUpdate(partner._id, action, rejectReason.trim());
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  // 3. Derived stats
  const stats = useMemo(() => {
    return {
      total: partners.length,
      pending: partners.filter(p => p.status === 'Pending').length,
      approved: partners.filter(p => p.status === 'Approved').length,
      rejected: partners.filter(p => p.status === 'Rejected').length,
      suspended: partners.filter(p => p.status === 'Suspended').length,
    };
  }, [partners]);

  // 3b. Derived activity log — flatten every partner's statusHistory into one timeline
  const activityLog = useMemo(() => {
    const entries = [];
    partners.forEach(p => {
      (p.statusHistory || []).forEach((h, idx) => {
        entries.push({
          id: `${p._id}-${idx}-${h.updatedAt}`,
          pharmacyName: p.pharmacyName,
          action: h.status,
          reason: h.reason,
          rawTime: h.updatedAt,
          time: h.updatedAt
            ? new Date(h.updatedAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
            : '—',
        });
      });
    });
    return entries.sort((a, b) => new Date(b.rawTime) - new Date(a.rawTime));
  }, [partners]);

  // 3c. Activity log filtered by pharmacy name search
  const filteredActivityLog = useMemo(() => {
    if (!logSearchTerm.trim()) return activityLog;
    const term = logSearchTerm.toLowerCase();
    return activityLog.filter(entry => entry.pharmacyName?.toLowerCase().includes(term));
  }, [activityLog, logSearchTerm]);

  // 3d. Per-pharmacy summary counts (approved/rejected/suspended times) — shown when searching
  const logSearchSummary = useMemo(() => {
    if (!logSearchTerm.trim() || filteredActivityLog.length === 0) return null;
    const counts = { Approved: 0, Rejected: 0, Suspended: 0 };
    filteredActivityLog.forEach(e => {
      if (counts[e.action] !== undefined) counts[e.action]++;
    });
    return counts;
  }, [filteredActivityLog, logSearchTerm]);

  // 4. Filter + search
  const visiblePartners = useMemo(() => {
    return partners.filter(p => {
      const matchesFilter = activeFilter === 'All' || p.status === activeFilter;
      const matchesSearch =
        p.pharmacyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.ownerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.city?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [partners, activeFilter, searchTerm]);

  const getInitials = (name = '') =>
    name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  if (loading) {
    return (
      <div className={styles.adminContainer}>
        <div className={styles.header}>
          <h1>Admin Partner Management</h1>
          <p>Review and verify pharmacy applications</p>
        </div>
        <div className={styles.skeletonStats}>
          {[1, 2, 3, 4, 5].map(i => <div key={i} className={styles.skeletonCard} />)}
        </div>
        <div className={styles.skeletonTable} />
      </div>
    );
  }

  return (
    <div className={styles.adminContainer}>
      <div className={styles.header}>
        <div>
          <h1>Admin Partner Management</h1>
          <p>Review and verify pharmacy applications</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/admin/feedback" className={styles.logBtn} style={{ textDecoration: 'none' }}>
            <MessageSquare size={16} /> Feedback
          </Link>
          <button className={styles.logBtn} onClick={() => setLogOpen(true)}>
            <History size={16} /> Activity Log
            {activityLog.length > 0 && <span className={styles.logBadge}>{activityLog.length}</span>}
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.iconTotal}`}><Users size={20} /></div>
          <div>
            <div className={styles.statValue}>{stats.total}</div>
            <div className={styles.statLabel}>Total Applications</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.iconPending}`}><Clock size={20} /></div>
          <div>
            <div className={styles.statValue}>{stats.pending}</div>
            <div className={styles.statLabel}>Pending Review</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.iconApproved}`}><PackageCheck size={20} /></div>
          <div>
            <div className={styles.statValue}>{stats.approved}</div>
            <div className={styles.statLabel}>Approved</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.iconRejected}`}><PackageX size={20} /></div>
          <div>
            <div className={styles.statValue}>{stats.rejected}</div>
            <div className={styles.statLabel}>Rejected</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.iconSuspended}`}><Ban size={20} /></div>
          <div>
            <div className={styles.statValue}>{stats.suspended}</div>
            <div className={styles.statLabel}>Suspended</div>
          </div>
        </div>
      </div>

      {/* Filter + search toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.filterTabs}>
          {['All', 'Pending', 'Approved', 'Rejected', 'Suspended'].map(f => (
            <button
              key={f}
              className={`${styles.filterTab} ${activeFilter === f ? styles.filterTabActive : ''}`}
              onClick={() => setActiveFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
        <div className={styles.searchBox}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by pharmacy, owner, or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.tableWrapper}>
        {visiblePartners.length === 0 ? (
          <div className={styles.emptyState}>
            <AlertCircle size={32} />
            <p>No applications match this view.</p>
            <span>Try a different filter or search term.</span>
          </div>
        ) : (
          <table className={styles.partnerTable}>
            <thead>
              <tr>
                <th>Pharmacy Name</th>
                <th>Owner &amp; Contact</th>
                <th>Location</th>
                <th>Current Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visiblePartners.map((p) => (
                <tr key={p._id} className={styles[`row_${p.status.toLowerCase()}`]}>
                  <td>
                    <div className={styles.pharmacyName}>
                      <div className={styles.avatar}>{getInitials(p.pharmacyName)}</div>
                      <div>
                        <strong>{p.pharmacyName}</strong>
                        <div className={styles.subMeta}>
                          <Building2 size={12} /> Pharmacy
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div>{p.ownerName}</div>
                    <small>{p.email}</small>
                  </td>
                  <td>{p.city}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${styles[p.status.toLowerCase()]}`}>
                      <span className={styles.statusDot} />
                      {p.status}
                    </span>
                  </td>
                  <td className={styles.actionButtons}>
                    <button
                      className={styles.detailBtn}
                      onClick={() => setDetailModal(p)}
                      title="View full details"
                    >🔍 Details</button>
                    {p.status === 'Pending' && (
                      <>
                        <button
                          className={styles.approveBtn}
                          disabled={updatingId === p._id}
                          onClick={() => openConfirm(p, 'Approved')}
                        >
                          <CheckCircle size={16} /> {updatingId === p._id ? 'Working...' : 'Approve'}
                        </button>
                        <button
                          className={styles.rejectBtn}
                          disabled={updatingId === p._id}
                          onClick={() => openConfirm(p, 'Rejected')}
                        >
                          <XCircle size={16} /> {updatingId === p._id ? 'Working...' : 'Reject'}
                        </button>
                      </>
                    )}
                    {p.status === 'Approved' && (
                      <button
                        className={styles.suspendBtn}
                        disabled={updatingId === p._id}
                        onClick={() => openConfirm(p, 'Suspended')}
                      >
                        <Ban size={16} /> {updatingId === p._id ? 'Working...' : 'Suspend'}
                      </button>
                    )}
                    {p.status === 'Suspended' && (
                      <button
                        className={styles.reactivateBtn}
                        disabled={updatingId === p._id}
                        onClick={() => openConfirm(p, 'Approved')}
                      >
                        <RotateCcw size={16} /> {updatingId === p._id ? 'Working...' : 'Reactivate'}
                      </button>
                    )}
                    {p.status === 'Rejected' && (
                      <span className={styles.completedText}>Processed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Toast notification */}
      {toast && (
        <div className={`${styles.toast} ${styles[`toast_${toast.type}`]}`}>
          {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
          {toast.message}
        </div>
      )}

      {/* ✅ FULL DETAIL MODAL */}
      {detailModal && (
        <div className={styles.modalOverlay} onClick={() => setDetailModal(null)}
          style={{ alignItems: 'flex-start', paddingTop: 24, paddingBottom: 24, overflowY: 'auto' }}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 580, width: 'min(92%, 580px)', margin: '0 auto', borderRadius: 16, padding: 0, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>

            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)', padding: 'clamp(14px,3vw,20px) clamp(16px,4vw,24px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                <div style={{ width: 42, height: 42, flexShrink: 0, borderRadius: 10, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, fontWeight: 700, color: '#fff' }}>
                  {detailModal.pharmacyName?.charAt(0).toUpperCase()}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ color: '#fff', fontWeight: 700, fontSize: 'clamp(13px,2.5vw,16px)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{detailModal.pharmacyName}</div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>Partner Application</div>
                </div>
              </div>
              <button onClick={() => setDetailModal(null)} style={{ flexShrink: 0, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: '#fff', fontSize: 16, marginLeft: 8 }}>✕</button>
            </div>

            {/* Status bar */}
            <div style={{ background: detailModal.status === 'Approved' ? '#d1fae5' : detailModal.status === 'Rejected' ? '#fee2e2' : '#fef3c7', borderBottom: '1px solid #e2e8f0', padding: '8px clamp(16px,4vw,24px)', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', fontSize: 'clamp(11px,2vw,13px)', fontWeight: 600, color: detailModal.status === 'Approved' ? '#065f46' : detailModal.status === 'Rejected' ? '#991b1b' : '#92400e', position: 'sticky', top: 64, zIndex: 9 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'currentColor', display: 'inline-block', flexShrink: 0 }} />
              {detailModal.status} · Registered {detailModal.createdAt ? new Date(detailModal.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
            </div>

            {/* Body */}
            <div style={{ padding: 'clamp(16px,4vw,24px)', background: '#fff' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 14 }}>Pharmacy Information</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px 20px' }}>
                {[
                  { label: 'Pharmacy Name', value: detailModal.pharmacyName },
                  { label: 'Owner Name',    value: detailModal.ownerName },
                  { label: 'Email',         value: detailModal.email },
                  { label: 'Phone',         value: detailModal.phone },
                  { label: 'City',          value: detailModal.city },
                  { label: 'License No.',   value: detailModal.licenseNo },
                  { label: 'POS System',    value: detailModal.posSystem || 'Not specified' },
                ].map(({ label, value }) => (
                  <div key={label} style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: 10 }}>
                    <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, marginBottom: 3, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
                    <div style={{ fontSize: 'clamp(12px,2vw,14px)', color: '#1e293b', fontWeight: 500, wordBreak: 'break-all' }}>{value || '—'}</div>
                  </div>
                ))}
                <div style={{ gridColumn: '1 / -1', borderBottom: '1px solid #f1f5f9', paddingBottom: 10 }}>
                  <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, marginBottom: 3, textTransform: 'uppercase', letterSpacing: 0.5 }}>Full Address</div>
                  <div style={{ fontSize: 'clamp(12px,2vw,14px)', color: '#1e293b', fontWeight: 500 }}>{detailModal.address || '—'}</div>
                </div>
              </div>

              <div style={{ height: 1, background: '#f1f5f9', margin: '18px 0' }} />

              <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>Drug License Document</div>
              {detailModal.licenseImageUrl ? (
                <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
                  <img src={detailModal.licenseImageUrl} alt="Drug License" style={{ width: '100%', maxHeight: 'clamp(160px,40vw,280px)', objectFit: 'contain', background: '#f8fafc', display: 'block' }} onError={(e) => { e.target.style.display = 'none'; }} />
                  <a href={detailModal.licenseImageUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', color: '#3b5bdb', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>🔗 Open Full Image in New Tab</a>
                </div>
              ) : (
                <div style={{ padding: '24px', textAlign: 'center', background: '#f8fafc', border: '2px dashed #e2e8f0', borderRadius: 12, color: '#94a3b8', fontSize: 13 }}>No license image uploaded</div>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: 'clamp(12px,3vw,16px) clamp(16px,4vw,24px)', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button className={styles.modalCancel} onClick={() => setDetailModal(null)}>Close</button>
              {detailModal.status === 'Pending' && (
                <>
                  <button className={styles.approveBtn} onClick={() => { setDetailModal(null); openConfirm(detailModal, 'Approved'); }}><CheckCircle size={15} /> Approve</button>
                  <button className={styles.rejectBtn} onClick={() => { setDetailModal(null); openConfirm(detailModal, 'Rejected'); }}><XCircle size={15} /> Reject</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Approve / Reject confirmation modal */}
      {confirmModal && (
        <div className={styles.modalOverlay} onClick={() => setConfirmModal(null)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>
                {confirmModal.action === 'Approved' && 'Approve pharmacy?'}
                {confirmModal.action === 'Rejected' && 'Reject application'}
                {confirmModal.action === 'Suspended' && 'Suspend pharmacy'}
              </h3>
              <button className={styles.modalClose} onClick={() => setConfirmModal(null)}>
                <X size={18} />
              </button>
            </div>

            <p className={styles.modalSubtext}>
              {confirmModal.action === 'Approved' &&
                `${confirmModal.partner.pharmacyName} will be marked as approved and can start operating on the platform.`}
              {confirmModal.action === 'Rejected' &&
                `Let ${confirmModal.partner.pharmacyName} know why their application was rejected. This reason is recorded in the activity log.`}
              {confirmModal.action === 'Suspended' &&
                `${confirmModal.partner.pharmacyName} will be temporarily deactivated and won't be able to operate on the platform until reactivated. Let them know why.`}
            </p>

            <div className={styles.infoCard}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>License Number</span>
                <span className={styles.infoValue}>{confirmModal.partner.licenseNo || '—'}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Contact Number</span>
                <span className={styles.infoValue}>{confirmModal.partner.phone || '—'}</span>
              </div>
            </div>

            {(confirmModal.action === 'Rejected' || confirmModal.action === 'Suspended') && (
              <textarea
                className={styles.reasonInput}
                placeholder={
                  confirmModal.action === 'Suspended'
                    ? 'e.g. Multiple customer complaints about expired stock.'
                    : 'e.g. License document unclear, please re-upload a valid pharmacy license.'
                }
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
                autoFocus
              />
            )}

            <div className={styles.modalActions}>
              <button className={styles.modalCancel} onClick={() => setConfirmModal(null)}>
                Cancel
              </button>
              <button
                className={
                  confirmModal.action === 'Approved' ? styles.approveBtn
                    : confirmModal.action === 'Suspended' ? styles.suspendBtn
                    : styles.rejectBtn
                }
                onClick={submitConfirm}
                disabled={updatingId === confirmModal.partner._id}
              >
                {confirmModal.action === 'Approved' && <CheckCircle size={16} />}
                {confirmModal.action === 'Rejected' && <XCircle size={16} />}
                {confirmModal.action === 'Suspended' && <Ban size={16} />}
                {updatingId === confirmModal.partner._id
                  ? 'Working...'
                  : confirmModal.action === 'Approved' ? 'Confirm approval'
                  : confirmModal.action === 'Suspended' ? 'Confirm suspension'
                  : 'Confirm rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Activity log slide-over */}
      <div className={`${styles.logPanel} ${logOpen ? styles.logPanelOpen : ''}`}>
        <div className={styles.logPanelHeader}>
          <h3><History size={18} /> Activity Log</h3>
          <button className={styles.modalClose} onClick={() => setLogOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <div className={styles.logSearchBox}>
          <Search size={15} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by pharmacy name..."
            value={logSearchTerm}
            onChange={(e) => setLogSearchTerm(e.target.value)}
          />
        </div>

        {logSearchSummary && (
          <div className={styles.logSummary}>
            <span className={styles.logSummaryItem}><CheckCircle size={13} /> {logSearchSummary.Approved} approved</span>
            <span className={styles.logSummaryItem}><XCircle size={13} /> {logSearchSummary.Rejected} rejected</span>
            <span className={styles.logSummaryItem}><Ban size={13} /> {logSearchSummary.Suspended} suspended</span>
          </div>
        )}

        <div className={styles.logPanelBody}>
          {filteredActivityLog.length === 0 ? (
            <div className={styles.logEmpty}>
              {logSearchTerm.trim() ? `No activity found for "${logSearchTerm}".` : 'No actions taken yet.'}
            </div>
          ) : (
            filteredActivityLog.map(entry => (
              <div key={entry.id} className={styles.logEntry}>
                <span className={`${styles.logDot} ${
                  entry.action === 'Approved' ? styles.logDotApproved
                    : entry.action === 'Suspended' ? styles.logDotSuspended
                    : styles.logDotRejected
                }`} />
                <div>
                  <div className={styles.logTitle}>
                    <strong>{entry.pharmacyName}</strong> was {entry.action.toLowerCase()}
                  </div>
                  {entry.reason && <div className={styles.logReason}>&ldquo;{entry.reason}&rdquo;</div>}
                  <div className={styles.logTime}>{entry.time}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      {logOpen && <div className={styles.logBackdrop} onClick={() => setLogOpen(false)} />}
    </div>
  );
};

export default AdminDashboard;