import React, { useState, useEffect } from "react";
import "./PdfModal.css";

const PdfModal = ({ isOpen, onClose, pdfUrl, title = "Answer Sheet" }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setHasError(false);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, pdfUrl]);

  if (!isOpen) return null;

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const handleOpenInNewTab = () => {
    window.open(pdfUrl, '_blank', 'noopener,noreferrer');
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `${title.replace(/[^a-z0-9]/gi, '_')}.pdf`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="pdf-modal-overlay" onClick={onClose}>
      <div className="pdf-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="pdf-modal-header">
          <div className="pdf-modal-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            <span>{title}</span>
          </div>
          <div className="pdf-modal-actions">
            <button
              className="pdf-action-btn"
              onClick={handleDownload}
              title="Download PDF"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            </button>
            <button
              className="pdf-action-btn"
              onClick={handleOpenInNewTab}
              title="Open in new tab"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
            </button>
            <button
              className="pdf-close-btn"
              onClick={onClose}
              title="Close"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="pdf-modal-body">
          {isLoading && (
            <div className="pdf-loading-state">
              <div className="pdf-spinner"></div>
              <p>Loading document...</p>
            </div>
          )}

          {hasError && (
            <div className="pdf-error-state">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <h3>Unable to load PDF</h3>
              <p>The document could not be displayed in the viewer.</p>
              <button className="pdf-error-btn" onClick={handleOpenInNewTab}>
                Open in New Tab
              </button>
            </div>
          )}

          <iframe
            src={pdfUrl}
            title="PDF Viewer"
            className={`pdf-iframe ${isLoading ? 'loading' : ''}`}
            onLoad={handleIframeLoad}
            onError={handleIframeError}
          />
        </div>
      </div>
    </div>
  );
};

export default PdfModal;
