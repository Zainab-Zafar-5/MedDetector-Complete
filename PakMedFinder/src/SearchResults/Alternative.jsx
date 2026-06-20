import React, { useState, useEffect } from 'react';
import { Loader2, X, Pill, MapPin, Tag, ArrowRight, PackageSearch } from 'lucide-react';

const Alternative = ({ medName, genericName, onClose, onSelectAlternative }) => {
    const [alternatives, setAlternatives] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchAlt = async () => {
            setLoading(true);
            try {
                const response = await fetch(
                    `http://localhost:5000/api/alternatives?name=${encodeURIComponent(medName)}&genericName=${encodeURIComponent(genericName)}`
                );
                const result = await response.json();
                setAlternatives(result.data || []);
            } catch (err) {
                console.error("Alt fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        if (medName) fetchAlt();
    }, [medName, genericName]);

    const handleAltClick = (alt) => {
        // Close this modal and tell parent to search/scroll to this medicine
        onClose();
        if (onSelectAlternative) {
            onSelectAlternative(alt.name);
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                style={{
                    position: 'fixed', inset: 0,
                    background: 'rgba(10, 15, 40, 0.65)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 1000,
                }}
            />

            {/* Modal Panel */}
            <div style={{
                position: 'fixed',
                top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 'min(520px, 92vw)',
                maxHeight: '80vh',
                background: '#fff',
                borderRadius: '20px',
                boxShadow: '0 24px 60px rgba(0,0,0,0.2)',
                zIndex: 1001,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
            }}>
                {/* Header */}
                <div style={{
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)',
                    padding: '20px 24px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '12px',
                    flexShrink: 0,
                }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div style={{
                            background: 'rgba(251,191,36,0.15)',
                            border: '1px solid rgba(251,191,36,0.3)',
                            borderRadius: '10px',
                            padding: '8px',
                            display: 'flex',
                        }}>
                            <Pill size={20} color="#fbbf24" />
                        </div>
                        <div>
                            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '11px', margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                Alternatives for
                            </p>
                            <h3 style={{ color: '#fff', margin: 0, fontSize: '17px', fontWeight: 700 }}>
                                {medName}
                            </h3>
                            {genericName && (
                                <p style={{ color: 'rgba(255,255,255,0.45)', margin: '2px 0 0', fontSize: '12px' }}>
                                    Generic: {genericName}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        style={{
                            background: 'rgba(255,255,255,0.1)',
                            border: '1px solid rgba(255,255,255,0.15)',
                            borderRadius: '10px',
                            padding: '7px',
                            cursor: 'pointer',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            transition: 'background 0.2s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                        aria-label="Close"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Sub-header hint */}
                {!loading && alternatives.length > 0 && (
                    <div style={{
                        background: '#f0fdf4',
                        borderBottom: '1px solid #bbf7d0',
                        padding: '9px 24px',
                        fontSize: '12px',
                        color: '#15803d',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        flexShrink: 0,
                    }}>
                        <ArrowRight size={13} />
                        Click any alternative to search it in results
                    </div>
                )}

                {/* Body — scrollable */}
                <div style={{ overflowY: 'auto', padding: '16px 20px', flex: 1 }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '48px 0', color: '#64748b' }}>
                            <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
                            <p style={{ margin: 0, fontSize: '14px' }}>Finding alternatives...</p>
                        </div>
                    ) : alternatives.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {alternatives.map((alt, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleAltClick(alt)}
                                    style={{
                                        width: '100%',
                                        background: '#fff',
                                        border: '1.5px solid #e2e8f0',
                                        borderRadius: '14px',
                                        padding: '14px 16px',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        transition: 'all 0.18s ease',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        gap: '12px',
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.borderColor = '#3b82f6';
                                        e.currentTarget.style.background = '#eff6ff';
                                        e.currentTarget.style.transform = 'translateX(4px)';
                                        e.currentTarget.style.boxShadow = '0 4px 16px rgba(59,130,246,0.12)';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.borderColor = '#e2e8f0';
                                        e.currentTarget.style.background = '#fff';
                                        e.currentTarget.style.transform = 'translateX(0)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{
                                            margin: '0 0 6px',
                                            fontWeight: 700,
                                            fontSize: '15px',
                                            color: '#0f172a',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                        }}>
                                            {alt.name}
                                        </p>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '12px', color: '#64748b' }}>
                                            {alt.pharmacyName && (
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <MapPin size={11} /> {alt.pharmacyName}
                                                </span>
                                            )}
                                            {alt.price && (
                                                <span style={{
                                                    display: 'flex', alignItems: 'center', gap: '4px',
                                                    background: '#f0fdf4',
                                                    color: '#16a34a',
                                                    padding: '2px 8px',
                                                    borderRadius: '20px',
                                                    fontWeight: 600,
                                                    border: '1px solid #bbf7d0',
                                                }}>
                                                    <Tag size={10} /> Rs. {alt.price}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <ArrowRight size={16} color="#94a3b8" style={{ flexShrink: 0 }} />
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '48px 0', color: '#94a3b8' }}>
                            <PackageSearch size={40} style={{ marginBottom: '12px', opacity: 0.5 }} />
                            <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#64748b' }}>No alternatives found</p>
                            <p style={{ margin: '6px 0 0', fontSize: '13px' }}>Try searching with a different name</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{
                    borderTop: '1px solid #f1f5f9',
                    padding: '12px 20px',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    flexShrink: 0,
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            background: '#f1f5f9',
                            border: 'none',
                            borderRadius: '10px',
                            padding: '9px 20px',
                            fontSize: '13px',
                            fontWeight: 600,
                            color: '#475569',
                            cursor: 'pointer',
                        }}
                    >
                        Close
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </>
    );
};

export default Alternative;