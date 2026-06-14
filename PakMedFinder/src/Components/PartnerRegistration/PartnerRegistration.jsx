import React, { useState, useEffect } from 'react';
import styles from './PartnerRegistration.module.css';

const PartnerRegistration = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    pharmacyName: '',
    licenseNo: '', // 🔥 FIX 1: Property name badal kar 'licenseNo' kar diya taake database schema se automatic match ho
    posSystem: '',
    ownerName: '',
    email: '',
    password: '', 
    phone: '',
    city: '',
    address: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const validateStep = () => {
    let newErrors = {};
    
    if (step === 1) {
      if (!formData.pharmacyName) newErrors.pharmacyName = "Pharmacy name is required";
      if (!formData.licenseNo) newErrors.licenseNo = "License number is required"; // 🔥 FIX 2: Validation check variable key matching
      if (!formData.posSystem) newErrors.posSystem = "Please select a POS system";
    } 
    else if (step === 2) {
      if (!formData.ownerName) newErrors.ownerName = "Owner name is required";
      if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Valid email is required";
      
      if (!formData.password || formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
      }

      if (!formData.phone || formData.phone.length < 10) newErrors.phone = "Valid phone number is required";
    }
    else if (step === 3) {
      if (!formData.city) newErrors.city = "City is required";
      if (!formData.address) newErrors.address = "Complete address is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      if (step === 3) {
        handleSubmit();
      } else {
        setStep(step + 1);
      }
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/register-partner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setStep(4);
      } else {
        alert("Error: " + (result.message || result.error)); 
      }
    } catch (error) {
      console.error("Submission failed:", error);
      alert("Server connection failed.");
    }
  };

  return (
    <div className={styles.registrationWrapper}>
      <div className={styles.formContainer}>
        {step < 4 && (
          <div className={styles.progressHeader}>
            <div className={`${styles.stepIndicator} ${step >= 1 ? styles.active : ''}`}>1</div>
            <div className={`${styles.stepIndicator} ${step >= 2 ? styles.active : ''}`}>2</div>
            <div className={`${styles.stepIndicator} ${step >= 3 ? styles.active : ''}`}>3</div>
          </div>
        )}

        <div className={styles.stepContent}>
          {step === 1 && (
            <div>
              <h2>Pharmacy Details</h2>
              <input name="pharmacyName" value={formData.pharmacyName} onChange={handleChange} placeholder="Pharmacy Name" />
              {errors.pharmacyName && <span className={styles.errorText}>{errors.pharmacyName}</span>}
              
              {/* 🔥 FIX 3: Input field name attribute exact 'licenseNo' kar diya */}
              <input name="licenseNo" value={formData.licenseNo} onChange={handleChange} placeholder="Drug License Number" />
              {errors.licenseNo && <span className={styles.errorText}>{errors.licenseNo}</span>}
              
              <select name="posSystem" value={formData.posSystem} onChange={handleChange}>
                <option value="">Select Existing POS System</option>
                <option value="plus">Pharmacy Plus</option>
                <option value="retail">Retail Pro</option>
                <option value="other">Other</option>
              </select>
              {errors.posSystem && <span className={styles.errorText}>{errors.posSystem}</span>}
              
              <button onClick={handleNext} className={styles.nextBtn}>Continue</button>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2>Contact & Security</h2>
              <input name="ownerName" value={formData.ownerName} onChange={handleChange} placeholder="Owner Name" />
              {errors.ownerName && <span className={styles.errorText}>{errors.ownerName}</span>}

              <input name="email" value={formData.email} onChange={handleChange} placeholder="Email" />
              {errors.email && <span className={styles.errorText}>{errors.email}</span>}

              <input 
                name="password" 
                type="password" 
                value={formData.password} 
                onChange={handleChange} 
                placeholder="Create Password (min 6 chars)" 
              />
              {errors.password && <span className={styles.errorText}>{errors.password}</span>}

              <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone (e.g. 03001234567)" />
              {errors.phone && <span className={styles.errorText}>{errors.phone}</span>}

              <div className={styles.btnGroup}>
                <button onClick={() => setStep(step - 1)} className={styles.backBtn}>Back</button>
                <button onClick={handleNext} className={styles.nextBtn}>Next Step</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2>Location Details</h2>
              <input name="city" value={formData.city} onChange={handleChange} placeholder="City" />
              {errors.city && <span className={styles.errorText}>{errors.city}</span>}

              <textarea name="address" value={formData.address} onChange={handleChange} placeholder="Full Address" rows="3" />
              {errors.address && <span className={styles.errorText}>{errors.address}</span>}

              <div className={styles.btnGroup}>
                <button onClick={() => setStep(step - 1)} className={styles.backBtn}>Back</button>
                <button onClick={handleNext} className={styles.submitBtn}>Submit Application</button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className={styles.successMessage}>
              <div style={{fontSize: '4rem', color: '#10b981', marginBottom: '20px'}}>✔</div>
              <h2>Application Submitted!</h2>
              <p>Your account is now <b>Pending</b>. Please wait for admin approval.</p>
              <button onClick={() => window.location.href = '/login'} className={styles.nextBtn}>
                Go to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PartnerRegistration;