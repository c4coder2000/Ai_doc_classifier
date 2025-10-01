import React from 'react';
import styles from './ExportPreview.module.css';

const ExportPreview = ({ results, files }) => {
  if (!results || results.length === 0) return null;

  const totalDocuments = results.length;
  const successfulClassifications = results.filter(r => r.label !== 'Error').length;
  const averageConfidence = results
    .filter(r => r.confidence && typeof r.confidence === 'string' && r.confidence.includes('%'))
    .reduce((acc, r, _, arr) => acc + parseFloat(r.confidence) / arr.length, 0);

  return (
    <div className={styles.preview}>
      <div className={styles.previewHeader}>
        <span className={styles.previewIcon}>📊</span>
        <h4 className={styles.previewTitle}>Export Summary</h4>
      </div>
      
      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{totalDocuments}</span>
          <span className={styles.statLabel}>Documents</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{successfulClassifications}</span>
          <span className={styles.statLabel}>Classified</span>
        </div>
        {averageConfidence > 0 && (
          <div className={styles.stat}>
            <span className={styles.statValue}>{Math.round(averageConfidence)}%</span>
            <span className={styles.statLabel}>Avg Confidence</span>
          </div>
        )}
      </div>
      
      <div className={styles.includesText}>
        📄 PDF will include: High-quality document images, classifications, confidence scores, and extracted text
      </div>
      <div className={styles.qualityBadge}>
        ✨ High-Quality Images • Professional Layout • Print Ready
      </div>
    </div>
  );
};

export default ExportPreview;