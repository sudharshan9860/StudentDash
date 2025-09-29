import React, { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';

const CameraCapture = ({ onImageCapture, videoConstraints }) => {
  const webcamRef = useRef(null);
  const [image, setImage] = useState(null);
  const [displayDimensions, setDisplayDimensions] = useState({ width: 320, height: 240 });
  const [isMobile, setIsMobile] = useState(false);

  // Maximum quality constraints for text extraction
  const captureConstraints = {
    width: { ideal: 4096, min: 1920 },
    height: { ideal: 3072, min: 1080 },
    aspectRatio: { ideal: 4/3 },
    // Advanced constraints for better quality
    frameRate: { ideal: 30 },
    facingMode: { ideal: "environment" },
    // Override with user constraints
    ...videoConstraints,
    // Force high resolution if user specified lower
    ...(videoConstraints?.width?.ideal < 1920 ? { width: { ideal: 4096, min: 1920 } } : {}),
    ...(videoConstraints?.height?.ideal < 1080 ? { height: { ideal: 3072, min: 1080 } } : {})
  };

  // Calculate responsive display dimensions
  useEffect(() => {
    const calculateDimensions = () => {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const mobile = windowWidth <= 768;
      setIsMobile(mobile);
      
      const padding = 40;
      const buttonAreaHeight = 100;
      
      const maxWidth = windowWidth - padding;
      const maxHeight = windowHeight - buttonAreaHeight;
      
      let width, height;
      
      if (mobile) {
        width = maxWidth;
        height = Math.min((width * 4) / 3, maxHeight);
        if (height === maxHeight) {
          width = (height * 3) / 4;
        }
      } else {
        if (windowWidth > windowHeight) {
          height = Math.min(maxHeight, 480);
          width = (height * 16) / 9;
          if (width > maxWidth) {
            width = maxWidth;
            height = (width * 9) / 16;
          }
        } else {
          width = Math.min(maxWidth, 480);
          height = (width * 4) / 3;
          if (height > maxHeight) {
            height = maxHeight;
            width = (height * 3) / 4;
          }
        }
      }
      
      setDisplayDimensions({ width: Math.floor(width), height: Math.floor(height) });
    };

    calculateDimensions();
    window.addEventListener('resize', calculateDimensions);
    window.addEventListener('orientationchange', calculateDimensions);
    
    return () => {
      window.removeEventListener('resize', calculateDimensions);
      window.removeEventListener('orientationchange', calculateDimensions);
    };
  }, []);

  const capture = () => {
    // Capture at maximum possible resolution
    const imageSrc = webcamRef.current.getScreenshot({
      width: 4096,
      height: 3072
    });
    
    if (imageSrc) {
      // Optional: Enhance image quality for text extraction
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas to actual image size for no quality loss
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Apply sharpening and contrast enhancement for better text recognition
        ctx.filter = 'contrast(1.2) brightness(1.1)';
        ctx.drawImage(img, 0, 0);
        
        // Get enhanced image
        const enhancedImage = canvas.toDataURL('image/jpeg', 1.0);
        setImage(enhancedImage);
      };
      img.src = imageSrc;
    }
  };

  const dataURItoBlob = (dataURI) => {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  };

  const confirmImage = () => {
    if (image && onImageCapture) {
      const blob = dataURItoBlob(image);
      onImageCapture(blob);
      setImage(null);
    }
  };

  const retakeImage = () => {
    setImage(null);
  };

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: isMobile ? '10px' : '20px',
    width: '100%',
    height: '100%',
    boxSizing: 'border-box',
    overflow: 'hidden'
  };

  const webcamContainerStyle = {
    position: 'relative',
    width: `${displayDimensions.width}px`,
    height: `${displayDimensions.height}px`,
    borderRadius: '8px',
    overflow: 'hidden',
    border: '2px solid #e5e7eb',
    backgroundColor: '#000'
  };

  const buttonContainerStyle = {
    marginTop: '20px',
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
    flexWrap: 'wrap',
    width: '100%',
    maxWidth: `${displayDimensions.width}px`
  };

  const buttonStyle = {
    padding: isMobile ? '12px 24px' : '10px 20px',
    border: 'none',
    borderRadius: '6px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: isMobile ? '16px' : '14px',
    minWidth: '140px',
    justifyContent: 'center',
    touchAction: 'manipulation',
    WebkitTapHighlightColor: 'transparent'
  };

  // Image quality settings
  const imageSettings = {
    screenshotFormat: "image/jpeg",
    screenshotQuality: 1.0,
    forceScreenshotSourceSize: true
  };

  return (
    <div style={containerStyle}>
      {!image ? (
        <>
          <div style={webcamContainerStyle}>
            <Webcam
              audio={false}
              ref={webcamRef}
              {...imageSettings}
              width={displayDimensions.width}
              height={displayDimensions.height}
              videoConstraints={captureConstraints}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
              minScreenshotWidth={1920}
              minScreenshotHeight={1080}
            />
          </div>
          <div style={buttonContainerStyle}>
            <button
              type="button"
              onClick={capture}
              style={{
                ...buttonStyle,
                backgroundColor: '#3b82f6',
                color: 'white'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
              Capture Photo
            </button>
          </div>
          <div style={{ marginTop: '10px', textAlign: 'center', fontSize: '12px', color: '#6b7280' }}>
            Tip: Hold steady and ensure good lighting for best text capture
          </div>
        </>
      ) : (
        <>
          <div style={webcamContainerStyle}>
            <img 
              src={image} 
              alt="Captured" 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',  // Changed to contain to see full image
                backgroundColor: '#f3f4f6'
              }}
            />
          </div>
          <div style={buttonContainerStyle}>
            <button
              type="button"
              onClick={confirmImage}
              style={{
                ...buttonStyle,
                backgroundColor: '#10b981',
                color: 'white'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Use This Photo
            </button>
            <button
              type="button"
              onClick={retakeImage}
              style={{
                ...buttonStyle,
                backgroundColor: '#ef4444',
                color: 'white'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 4v6h6M23 20v-6h-6"/>
                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
              </svg>
              Retake
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CameraCapture;