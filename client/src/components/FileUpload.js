import React, { useState, useRef } from 'react';
import styles from './FileUpload.module.css';

const FileUpload = ({ onFilesSelected, isProcessing }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFiles = (files) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file =>
      file.type === 'image/jpeg' ||
      file.name.toLowerCase().endsWith('.jpg') ||
      file.name.toLowerCase().endsWith('.jpeg')
    );

    if (validFiles.length !== fileArray.length) {
      alert('Only JPG and JPEG files are supported.');
    }

    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
  };

  const handleChange = (e) => {
    handleFiles(e.target.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={styles.uploadContainer}>
      <div
        className={`${styles.uploadArea} ${isDragOver ? styles.dragOver : ''} ${isProcessing ? styles.processing : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleChange}
          accept=".jpg,.jpeg,image/jpeg"
          className={styles.hiddenInput}
        />
        
        <div className={styles.uploadContent}>
          {isProcessing ? (
            <>
              <div className={styles.spinner}></div>
              <div className={styles.uploadText}>Processing documents...</div>
              <div className={styles.uploadSubtext}>Please wait while we classify your files</div>
            </>
          ) : (
            <>
              <div className={styles.uploadIcon}>📁</div>
              <div className={styles.uploadText}>
                {isDragOver ? 'Drop your files here' : 'Drag & drop your documents'}
              </div>
              <div className={styles.uploadSubtext}>
                or <span className={styles.browseText}>browse files</span>
              </div>
              <div className={styles.supportedFormats}>
                Supports: JPG, JPEG
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
