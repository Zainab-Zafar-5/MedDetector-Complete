import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Loader2 } from 'lucide-react';

const Contact = () => {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [sending, setSending] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSending(true);
        // Backend API call simulate kar rahe hain
        setTimeout(() => {
            alert("Message Sent Successfully!");
            setFormData({ name: '', email: '', message: '' });
            setSending(false);
        }, 2000);
    };

    return (
        <div style={{ padding: '120px 20px', maxWidth: '1100px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                <h1 style={{ fontSize: '2.8rem', fontWeight: '800', color: '#0f172a' }}>Contact Us</h1>
                <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Have a query or want to report a shortage? Reach out to us.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '50px' }}>
                
                {/* --- Left Side: Contact Details --- */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center', padding: '20px', borderRadius: '15px', background: '#f8fafc' }}>
                        <div style={{ background: '#3b82f6', color: 'white', padding: '15px', borderRadius: '12px' }}>
                            <Mail size={24} />
                        </div>
                        <div>
                            <p style={{ margin: 0, fontWeight: '700' }}>Email Address</p>
                            <p style={{ margin: 0, color: '#64748b' }}>support@meddetector.com</p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center', padding: '20px', borderRadius: '15px', background: '#f8fafc' }}>
                        <div style={{ background: '#10b981', color: 'white', padding: '15px', borderRadius: '12px' }}>
                            <Phone size={24} />
                        </div>
                        <div>
                            <p style={{ margin: 0, fontWeight: '700' }}>Phone Number</p>
                            <p style={{ margin: 0, color: '#64748b' }}>+92 300 1234567</p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center', padding: '20px', borderRadius: '15px', background: '#f8fafc' }}>
                        <div style={{ background: '#ef4444', color: 'white', padding: '15px', borderRadius: '12px' }}>
                            <MapPin size={24} />
                        </div>
                        <div>
                            <p style={{ margin: 0, fontWeight: '700' }}>Office Location</p>
                            <p style={{ margin: 0, color: '#64748b' }}>UET, G.T Road, Lahore</p>
                        </div>
                    </div>
                </div>

                {/* --- Right Side: Form --- */}
                <form onSubmit={handleSubmit} style={{ 
                    background: 'white', padding: '40px', borderRadius: '24px', 
                    boxShadow: '0 20px 50px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' 
                }}>
                    <input 
                        type="text" placeholder="Your Name" required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        style={{ width: '100%', marginBottom: '20px', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none' }}
                    />
                    <input 
                        type="email" placeholder="Email Address" required
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        style={{ width: '100%', marginBottom: '20px', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none' }}
                    />
                    <textarea 
                        placeholder="How can we help?" rows="4" required
                        value={formData.message}
                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                        style={{ width: '100%', marginBottom: '20px', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', resize: 'none' }}
                    ></textarea>
                    
                    <button 
                        type="submit" disabled={sending}
                        style={{ 
                            width: '100%', background: '#0f172a', color: 'white', padding: '16px', 
                            borderRadius: '12px', fontWeight: 'bold', border: 'none', cursor: 'pointer',
                            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px'
                        }}
                    >
                        {sending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                        {sending ? "Sending Message..." : "Send Message"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Contact;