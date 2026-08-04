import React, { useState, useEffect, useRef } from 'react';
import { FaStar, FaRegStar } from 'react-icons/fa';
import styles from './FeedbackSection.module.css';
import { submitFeedback, searchPharmacies, getPublicFeedback } from "../../api";

function FeedbackSection() {
  const [type, setType] = useState('pharmacy');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerEmail, setReviewerEmail] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [feedbackList, setFeedbackList] = useState([]);
  const [refreshFlag, setRefreshFlag] = useState(0);
  const searchRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (type !== 'pharmacy' || !query.trim()) { setResults([]); return; }
    const timer = setTimeout(async () => {
      try {
        const res = await searchPharmacies(query);
        setResults(res?.data?.data || []);
        setShowDropdown(true);
      } catch { setResults([]); }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, type]);

  useEffect(() => {
    getPublicFeedback()
      .then((res) => setFeedbackList(res?.data?.data || []))
      .catch(() => setFeedbackList([]));
  }, [refreshFlag]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (type === 'pharmacy' && !selectedPharmacy) {
      setMessage('Please select a pharmacy first.');
      return;
    }
    setSubmitting(true);
    setMessage('');
    try {
      await submitFeedback({
        type,
        pharmacyName: type === 'pharmacy' ? selectedPharmacy.pharmacyName : undefined,
        reviewerName,
        reviewerEmail,
        rating,
        comment,
      });
      setMessage('Thank you! Your feedback has been submitted.');
      setComment('');
      setSelectedPharmacy(null);
      setQuery('');
      setReviewerName('');
      setReviewerEmail('');
      setRating(5);
      setRefreshFlag((r) => r + 1);
    } catch (err) {
      setMessage('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="feedback" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.feedbackBadge}>
          <h2 className={styles.headingBadge}>FEEDBACK</h2>
        </div>
        <h1 className={styles.pageTitle}>Share Your Experience</h1>
        <p className={styles.pageSubtitle}>
          Tell us about a pharmacy you visited, or share your thoughts on MedDetector.
        </p>

        <div className={styles.layout}>
          {/* Feedback Form */}
          <div className={styles.formCard}>
            <div className={styles.typeToggle}>
              <button
                type="button"
                className={`${styles.typeBtn} ${type === 'pharmacy' ? styles.typeBtnActive : ''}`}
                onClick={() => setType('pharmacy')}
              >
                Pharmacy Review
              </button>
              <button
                type="button"
                className={`${styles.typeBtn} ${type === 'website' ? styles.typeBtnActive : ''}`}
                onClick={() => setType('website')}
              >
                Website Feedback
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              {type === 'pharmacy' && (
                <div className={styles.searchWrap} ref={searchRef}>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="Search for a pharmacy..."
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setSelectedPharmacy(null); }}
                  />
                  {showDropdown && results.length > 0 && (
                    <ul className={styles.dropdown}>
                      {results.map((p) => (
                        <li key={p._id} onClick={() => { setSelectedPharmacy(p); setQuery(p.pharmacyName); setShowDropdown(false); }}>
                          {p.pharmacyName} <span className={styles.dropdownCity}>{p.city}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <div className={styles.row}>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Your Name"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  required
                />
                <input
                  type="email"
                  className={styles.input}
                  placeholder="Your Email"
                  value={reviewerEmail}
                  onChange={(e) => setReviewerEmail(e.target.value)}
                  required
                />
              </div>

              <div className={styles.starsRow}>
                <span className={styles.starsLabel}>Your Rating</span>
                <div className={styles.stars}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span
                      key={n}
                      className={styles.starIcon}
                      onClick={() => setRating(n)}
                      onMouseEnter={() => setHoverRating(n)}
                      onMouseLeave={() => setHoverRating(0)}
                    >
                      {n <= (hoverRating || rating) ? <FaStar /> : <FaRegStar />}
                    </span>
                  ))}
                </div>
              </div>

              <textarea
                className={styles.textarea}
                placeholder="Share your experience..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
              />

              <button type="submit" className={styles.submitBtn} disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
              {message && <p className={styles.formMessage}>{message}</p>}
            </form>
          </div>

          {/* Reviews List */}
          <div className={styles.reviewsPanel}>
            <h3 className={styles.reviewsHeading}>Pharmacy Reviews</h3>
            {feedbackList.length === 0 ? (
              <p className={styles.noReviews}>No reviews yet. Be the first to share your experience!</p>
            ) : (
              <div className={styles.reviewsScroll}>
                {feedbackList.map((f) => (
                  <div key={f._id} className={styles.reviewCard}>
                    <div className={styles.reviewHeader}>
                      <strong>{f.pharmacyName}</strong>
                      <span className={styles.reviewStars}>
                        {Array.from({ length: 5 }).map((_, i) =>
                          i < f.rating ? <FaStar key={i} /> : <FaRegStar key={i} />
                        )}
                      </span>
                    </div>
                    <p className={styles.reviewComment}>{f.comment}</p>
                    <small className={styles.reviewerName}>— {f.reviewerName}</small>
                    {f.reply?.text && (
                      <div className={styles.reply}>
                        <strong>Pharmacy Response</strong>
                        <p>{f.reply.text}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default FeedbackSection;
