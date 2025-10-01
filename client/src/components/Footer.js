import React from 'react';
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.footerContent}>
          <div className={styles.brand}>
            <h3 className={styles.brandName}>📄 DocClassifier</h3>
            <p className={styles.brandDescription}>
              Professional AI-powered document classification service
            </p>
          </div>
          
          <div className={styles.links}>
            <div className={styles.linkGroup}>
              <h4 className={styles.linkTitle}>Product</h4>
              <ul className={styles.linkList}>
                <li><a href="#features" className={styles.link}>Features</a></li>
                <li><a href="#pricing" className={styles.link}>Pricing</a></li>
                <li><a href="#api" className={styles.link}>API Access</a></li>
                <li><a href="#docs" className={styles.link}>Documentation</a></li>
              </ul>
            </div>
            
            <div className={styles.linkGroup}>
              <h4 className={styles.linkTitle}>Company</h4>
              <ul className={styles.linkList}>
                <li><a href="#about" className={styles.link}>About Us</a></li>
                <li><a href="#careers" className={styles.link}>Careers</a></li>
                <li><a href="#contact" className={styles.link}>Contact</a></li>
                <li><a href="#blog" className={styles.link}>Blog</a></li>
              </ul>
            </div>
            
            <div className={styles.linkGroup}>
              <h4 className={styles.linkTitle}>Support</h4>
              <ul className={styles.linkList}>
                <li><a href="#help" className={styles.link}>Help Center</a></li>
                <li><a href="#privacy" className={styles.link}>Privacy Policy</a></li>
                <li><a href="#terms" className={styles.link}>Terms of Service</a></li>
                <li><a href="#security" className={styles.link}>Security</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className={styles.footerBottom}>
          <div className={styles.copyright}>
            <p>&copy; 2025 DocClassifier. All rights reserved.</p>
          </div>
          <div className={styles.certifications}>
            <span className={styles.cert}>🔒 SSL Secured</span>
            <span className={styles.cert}>✓ GDPR Compliant</span>
            <span className={styles.cert}>🛡️ SOC 2 Type II</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;