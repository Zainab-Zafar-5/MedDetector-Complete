import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, Pill, AlertCircle } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

   if (data.success) {
    // 1. Professional Token Storage (Consistent Key)
    localStorage.setItem('pharmacyToken', data.token);
    
    // 2. State Normalization: Store user object with consistent parsing
    // Always store the full object to avoid "undefined" errors in components
    localStorage.setItem('user', JSON.stringify(data.user || {}));
    localStorage.setItem('userRole', data.user?.role || "USER");
    
    // 3. Navigation with Replace: Prevent users from pressing "Back" to return to Login
    const targetRoute = data.user.role === "ADMIN" ? '/admin/dashboard' : '/pharmacy/dashboard';
    
    // Triggering a hard window reload is a common trick to clear old 
    // context states if your app uses complex Context/Redux
    navigate(targetRoute, { replace: true });
}

        // Role-based routing system execution
       else {
        setError(data.message || "Invalid credentials");
      }
    } catch (err) {
      setError("Server connection failed.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <Pill size={40} color="#2563eb" />
          <h2>MedDetector</h2>
          <p>Partner Login Portal</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          {error && (
            <div className="error-box">
              <AlertCircle size={18} /> {error}
            </div>
          )}

          <div className="input-group">
            <Mail className="input-icon" size={20} />
            <input 
              type="email" 
              placeholder="Email Address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          <div className="input-group">
            <Lock className="input-icon" size={20} />
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <button type="submit" className="login-btn">
            <LogIn size={18} /> Login to Dashboard
          </button>
        </form>

        <div className="login-footer">
          <p>Not a partner yet? <span onClick={() => navigate('/partner-register')}>Register here</span></p>
        </div>
      </div>

      <style>{`
        .login-container { 
          height: 100vh; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          background: #f1f5f9; 
        }
        .login-card { 
          background: white; 
          padding: 2.5rem; 
          border-radius: 20px; 
          box-shadow: 0 10px 25px rgba(0,0,0,0.1); 
          width: 100%; 
          max-width: 400px; 
          text-align: center; 
        }
        .login-header h2 { margin: 10px 0 5px; color: #0f172a; }
        .login-header p { color: #64748b; font-size: 0.9rem; margin-bottom: 2rem; }
        .error-box { 
          background: #fee2e2; 
          color: #b91c1c; 
          padding: 10px; 
          border-radius: 8px; 
          margin-bottom: 1.5rem; 
          display: flex; 
          align-items: center; 
          gap: 8px; 
          font-size: 0.85rem; 
        }
        .input-group { position: relative; margin-bottom: 1rem; }
        .input-icon { position: absolute; left: 12px; top: 12px; color: #94a3b8; }
        .input-group input { 
          width: 100%; 
          padding: 12px 12px 12px 40px; 
          border: 1px solid #e2e8f0; 
          border-radius: 10px; 
          outline: none; 
          box-sizing: border-box;
        }
        .login-btn { 
          width: 100%; 
          background: #2563eb; 
          color: white; 
          border: none; 
          padding: 12px; 
          border-radius: 10px; 
          font-weight: bold; 
          cursor: pointer; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          gap: 10px; 
        }
        .login-footer { margin-top: 1.5rem; font-size: 0.85rem; color: #64748b; }
        .login-footer span { color: #2563eb; cursor: pointer; font-weight: bold; text-decoration: underline; }
      `}</style>
    </div>
  );
};

export default LoginPage;