import React, { useState } from 'react';
import styles from './FAQSection.module.css';
import { FaPlus, FaMinus, FaChevronRight } from 'react-icons/fa'; 

function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqData = [
    {
      question: "Is the medicine stock data reliable and up-to-date?",
      answer: "Yes. Our data is sourced from real-time pharmacy integrations and community reporting, combined with AI checks to ensure a reliability rate of over 99%. Stock status is updated every few hours."
    },
    {
      question: "How do I report stock for my local pharmacy?",
      answer: "Reporting is easy! Click the 'Report Stock' button (or link) and provide the medicine name and location. Community reporting helps keep the network live and accurate for everyone."
    },
    {
      question: "What happens if a medicine is out of stock?",
      answer: "If a medicine is out of stock, our system will automatically recommend safe, available alternatives based on the active salt and therapeutic class, so you never leave empty-handed."
    },
    {
      question: "Is MedDetector free to use?",
      answer: "Yes, MedDetector is currently a free-to-use platform dedicated to solving medicine shortages across Pakistan. We aim to keep core search and reporting features free for the community."
    }
  ];

  // *** FIX IS HERE: ADD THIS FUNCTION ***
  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className={styles.section}>
      <div className={styles.container}>
        
        <div className={styles.faqBadge}>
          <h2 className={styles.headingBadge}>FAQs</h2>
        </div>
        
        <div className={styles.accordionList}>
          {faqData.map((item, index) => (
            <div 
              key={index} 
              className={`${styles.accordionItem} ${openIndex === index ? styles.activeItem : ''}`}
            >
              <button 
                className={styles.accordionHeader} 
                onClick={() => toggleFAQ(index)} // This will now work!
              >
                {openIndex === index ? 
                  <FaMinus className={styles.toggleIconPlusMinus} /> : 
                  <FaPlus className={styles.toggleIconPlusMinus} />
                }
                
                <span className={styles.question}>{item.question}</span>
                
                <FaChevronRight className={styles.toggleIconChevron} />
              </button>
              
              <div 
                className={`${styles.accordionContent} ${openIndex === index ? styles.open : ''}`}
              >
                <p>{item.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FAQSection;