import React, { useState } from 'react';
import PDFExportButton from './PDFExportButton';
import styles from './ResultCard.module.css';

const ResultCard = ({ result, file }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const getConfidenceColor = (confidence) => {
    if (typeof confidence === 'string' && confidence.includes('%')) {
      const value = parseFloat(confidence);
      if (value >= 80) return 'high';
      if (value >= 60) return 'medium';
      return 'low';
    }
    return 'unknown';
  };

  const getStatusIcon = (label) => {
    if (label === 'Error') return '❌';
    return '✅';
  };

  const confidenceLevel = getConfidenceColor(result.confidence);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.fileName}>
          <span className={styles.fileIcon}>📄</span>
          {result.fileName}
        </div>
        <div className={styles.actions}>
          <PDFExportButton single result={result} file={file} />
          <div className={styles.status}>
            {getStatusIcon(result.label)}
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.labelSection}>
          <div className={styles.labelBadge}>
            <span className={styles.labelText}>{result.label}</span>
          </div>
          <div className={`${styles.confidenceBadge} ${styles[confidenceLevel]}`}>
            <span className={styles.confidenceText}>{result.confidence}</span>
          </div>
        </div>

        {result.summary && result.summary !== 'Failed to classify' && (
          <div className={styles.summarySection}>
            <h4 className={styles.sectionTitle}>Summary</h4>
            <p className={styles.summaryText}>{result.summary}</p>
          </div>
        )}

        {result.text && (
          <div className={styles.textSection}>
            <div className={styles.sectionHeader}>
              <h4 className={styles.sectionTitle}>Extracted Text</h4>
              <button
                className={styles.expandButton}
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? '🔼 Collapse' : '🔽 Expand'}
              </button>
            </div>
            <div className={`${styles.textContent} ${isExpanded ? styles.expanded : ''}`}>
              <pre className={styles.textPreview}>{result.text}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultCard;
