import React from 'react'
import styles from './HowItWorks.module.css'

function StepCard({ title, description, icon, className }) {
  return (
    <article className={`${styles.stepCard} ${className ? className : ''}`}>
      <div className={styles.iconWrap} aria-hidden="true">
        <div className={styles.iconCircle}>
          {icon}
        </div>
      </div>
      <h3 className={styles.stepTitle}>{title}</h3>
      <p className={styles.stepText}>{description}</p>
    </article>
  )
}


export default function HowItWorks({ steps = [] }) {
  return (
    <section className={styles.how} aria-label="How it works">
      <h2 className={styles.heading}>How MedConnect Works</h2>

<div className={styles.grid}>
  {steps.map((s, i) => (
    <StepCard 
      key={i} 
      title={s.title} 
      description={s.text} 
      icon={s.icon} 
      className={s.title.toLowerCase()} // "search", "report", "connect"
    />
  ))}
</div>


    </section>
  )
}
