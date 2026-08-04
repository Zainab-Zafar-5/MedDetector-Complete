import React, { useState, useEffect } from 'react';
import styles from './PartnerRegistration.module.css';

const PartnerRegistration = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [licenseFile, setLicenseFile] = useState(null);
  const [licensePreview, setLicensePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState({
    pharmacyName: '',
    licenseNo: '',
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Only allow images and pdf
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowed.includes(file.type)) {
      setErrors({ ...errors, licenseImage: 'Only JPG, PNG, WEBP or PDF allowed' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors({ ...errors, licenseImage: 'File size must be under 5MB' });
      return;
    }

    setLicenseFile(file);
    if (file.type !== 'application/pdf') {
      setLicensePreview(URL.createObjectURL(file));
    } else {
      setLicensePreview('pdf'); // PDF ke liye alag indicator
    }
    if (errors.licenseImage) setErrors({ ...errors, licenseImage: '' });
  };

  const validateStep = () => {
    let newErrors = {};
    
    if (step === 1) {
      if (!formData.pharmacyName) newErrors.pharmacyName = "Pharmacy name is required";
      if (!formData.licenseNo) newErrors.licenseNo = "License number is required";
      if (!formData.posSystem) newErrors.posSystem = "Please select a POS system";
      if (!licenseFile) newErrors.licenseImage = "Drug license image is required";
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
      setSubmitting(true);
      setUploadProgress(0);

      const data = new FormData();
      Object.entries(formData).forEach(([key, val]) => data.append(key, val));
      if (licenseFile) data.append('licenseImage', licenseFile);

      // ✅ XHR use karo — progress track karne ke liye (fetch progress nahi deta)
      const result = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'http://localhost:5000/api/register-partner');
        xhr.timeout = 120000; // ✅ 2 minute timeout — bari image ke liye

        xhr.upload.onprogress = (evt) => {
          if (evt.lengthComputable) {
            const pct = Math.round((evt.loaded / evt.total) * 100);
            setUploadProgress(pct);
          }
        };

        xhr.onload = () => {
          try {
            resolve(JSON.parse(xhr.responseText));
          } catch (err) {
            reject(new Error('Invalid server response'));
          }
        };

        xhr.ontimeout = () => reject(new Error('Upload timed out. Please try again with a smaller image.'));
        xhr.onerror = () => reject(new Error('Network error. Check your connection.'));
        xhr.send(data);
      });

      if (result.success) {
        setStep(4);
      } else {
        alert("Error: " + (result.message || result.error));
      }
    } catch (error) {
      console.error("Submission failed:", error);
      alert("Server connection failed.");
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
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
              
              <input name="licenseNo" value={formData.licenseNo} onChange={handleChange} placeholder="Drug License Number" />
              {errors.licenseNo && <span className={styles.errorText}>{errors.licenseNo}</span>}

              {/* ✅ License Image Upload */}
              <div className={styles.uploadBox}>
                <label className={styles.uploadLabel}>
                  <span>📄 Upload Drug License Image</span>
                  <span className={styles.uploadHint}>JPG, PNG, WEBP or PDF — max 5MB</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />
                  <span className={styles.uploadBtn}>
                    {licenseFile ? ' Change File' : '📁 Choose File'}
                  </span>
                </label>

                {/* Preview */}
                {licensePreview && licensePreview !== 'pdf' && (
                  <div className={styles.previewBox}>
                    <img src={licensePreview} alt="License preview" className={styles.previewImg} />
                    <button
                      type="button"
                      className={styles.removeBtn}
                      onClick={() => { setLicenseFile(null); setLicensePreview(''); }}
                    >✕ Remove</button>
                  </div>
                )}
                {licensePreview === 'pdf' && (
                  <div className={styles.pdfIndicator}>
                    📑 <strong>{licenseFile?.name}</strong> — PDF selected
                    <button
                      type="button"
                      className={styles.removeBtn}
                      onClick={() => { setLicenseFile(null); setLicensePreview(''); }}
                    >✕ Remove</button>
                  </div>
                )}
              </div>
              {errors.licenseImage && <span className={styles.errorText}>{errors.licenseImage}</span>}

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

              {/* ✅ Progress bar — prescription wala same UI */}
              {submitting && (
                <div style={{ margin: '16px 0' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '10px 14px',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    marginBottom: '8px',
                    fontSize: '14px',
                    color: '#1e293b',
                    fontWeight: '500'
                  }}>
                    <svg style={{ animation: 'spin 1s linear infinite', width: 16, height: 16, flexShrink: 0 }}
                      viewBox="0 0 24 24" fill="none" stroke="#3b5bdb" strokeWidth="2.5">
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                    </svg>
                    UPLOADING... {uploadProgress}%
                  </div>
                  <div style={{
                    height: '6px', background: '#e2e8f0',
                    borderRadius: '99px', overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${uploadProgress}%`,
                      background: 'linear-gradient(90deg, #3b5bdb, #60a5fa)',
                      borderRadius: '99px',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>
              )}

              <div className={styles.btnGroup}>
                <button
                  onClick={() => setStep(step - 1)}
                  className={styles.backBtn}
                  disabled={submitting}
                >Back</button>
                <button
                  onClick={handleNext}
                  className={styles.submitBtn}
                  disabled={submitting}
                  style={{ opacity: submitting ? 0.6 : 1, cursor: submitting ? 'not-allowed' : 'pointer' }}
                >
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>

              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
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