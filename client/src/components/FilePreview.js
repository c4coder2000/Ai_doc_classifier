import React from 'react';
import styles from './FilePreview.module.css';

const FilePreview = ({ files }) => (
  <div className={styles.previewGrid}>
    {files.map((file, idx) => (
      <div key={idx} className={styles.previewCard}>
        <p>{file.name}</p>
        <img src={URL.createObjectURL(file)} alt="preview" />
      </div>
    ))}
  </div>
);

export default FilePreview;
