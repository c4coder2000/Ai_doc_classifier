import React from 'react';
import styles from './Testimonials.module.css';

const Testimonials = () => {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Finance Manager at TechCorp",
      avatar: "👩‍💼",
      rating: 5,
      text: "DocClassifier has revolutionized our document processing workflow. We can now classify hundreds of invoices in minutes instead of hours."
    },
    {
      name: "Michael Chen",
      role: "Operations Director",
      avatar: "👨‍💻",
      rating: 5,
      text: "The accuracy is impressive. 99.2% accuracy rate means we can trust the AI to classify our documents correctly every time."
    },
    {
      name: "Emily Rodriguez",
      role: "Legal Assistant",
      avatar: "👩‍⚖️",
      rating: 5,
      text: "Perfect for legal document classification. The security features and GDPR compliance give us peace of mind."
    }
  ];

  return (
    <section className={styles.testimonials}>
      <div className={styles.container}>
        <h2 className={styles.title}>Trusted by professionals worldwide</h2>
        <div className={styles.grid}>
          {testimonials.map((testimonial, index) => (
            <div key={index} className={styles.card}>
              <div className={styles.rating}>
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i} className={styles.star}>⭐</span>
                ))}
              </div>
              <p className={styles.text}>"{testimonial.text}"</p>
              <div className={styles.author}>
                <span className={styles.avatar}>{testimonial.avatar}</span>
                <div className={styles.authorInfo}>
                  <div className={styles.name}>{testimonial.name}</div>
                  <div className={styles.role}>{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;