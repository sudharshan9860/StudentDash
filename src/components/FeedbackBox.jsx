import React, { useState, useRef, useContext, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faImage,
  faArrowRight,
  faArrowLeft,
  faCheck,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import "./FeedbackBox.css";
import { useAlert } from './AlertBox';
import { AuthContext } from './AuthContext';
import axiosInstance from "../api/axiosInstance";

const AUTO_SHOW_DELAY_MS = 2 * 60 * 1000; // 2 minutes
const FEEDBACK_SHOWN_KEY = 'feedback_modal_shown_session';

const REACTIONS = [
  { emoji: "😤", label: "Frustrated", value: 1, color: "#ef4444" },
  { emoji: "😕", label: "Confused", value: 2, color: "#f97316" },
  { emoji: "😐", label: "Okay", value: 3, color: "#eab308" },
  { emoji: "😊", label: "Good", value: 4, color: "#22c55e" },
  { emoji: "🤩", label: "Amazing", value: 5, color: "#8b5cf6" },
];

const FeedbackBox = ({ isOpen = false, onClose = () => {} }) => {
  const { username } = useContext(AuthContext);
  const { showAlert, AlertContainer } = useAlert();

  const [step, setStep] = useState(1);
  const [selectedReaction, setSelectedReaction] = useState(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hoveredReaction, setHoveredReaction] = useState(null);
  const [autoShowOpen, setAutoShowOpen] = useState(false);

  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const timerRef = useRef(null);

  // Check feedback status and auto-show modal after 2 mins if user hasn't submitted feedback
  useEffect(() => {
    // Skip if already shown this session
    if (sessionStorage.getItem(FEEDBACK_SHOWN_KEY)) {
      return;
    }

    const checkFeedbackStatus = async () => {
      try {
        const response = await axiosInstance.get('/api/user-info/');
        const feedbackStatus = response.data?.feedback_status;

        if (feedbackStatus === false) {
          // User hasn't submitted feedback - show after 2 minutes
          timerRef.current = setTimeout(() => {
            // Double-check it wasn't shown while waiting
            if (!sessionStorage.getItem(FEEDBACK_SHOWN_KEY)) {
              sessionStorage.setItem(FEEDBACK_SHOWN_KEY, 'true');
              setAutoShowOpen(true);
            }
          }, AUTO_SHOW_DELAY_MS);
        }
      } catch (error) {
        console.error('Error fetching user info for feedback status:', error);
      }
    };

    checkFeedbackStatus();

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleClose = useCallback(() => {
    setAutoShowOpen(false);
    onClose();
  }, [onClose]);

  const isModalOpen = isOpen || autoShowOpen;

  // Reset state when closing
  useEffect(() => {
    if (!isModalOpen) {
      const timer = setTimeout(() => {
        setStep(1);
        setSelectedReaction(null);
        setFeedbackText("");
        setSelectedFile(null);
        setPreviewUrl(null);
        setIsSuccess(false);
        setHoveredReaction(null);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isModalOpen]);

  // Focus textarea when entering step 2
  useEffect(() => {
    if (step === 2 && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 300);
    }
  }, [step]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match("image.*")) {
      showAlert("Please upload an image file", "warning");
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      showAlert("Image must be under 12MB", "warning");
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const clearSelectedFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleReactionSelect = (reaction) => {
    setSelectedReaction(reaction);
    // Auto-advance after selection with slight delay for animation
    setTimeout(() => setStep(2), 400);
  };

  const handleSubmit = async () => {
    if (!selectedReaction) return;

    // For low ratings, require feedback text
    if (selectedReaction.value <= 2 && !feedbackText.trim()) {
      showAlert("Please tell us what went wrong", "warning");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("message", feedbackText.trim());
      formData.append("rating", selectedReaction.value.toString());

      if (selectedFile) {
        formData.append("feedback_image", selectedFile, selectedFile.name);
      }

      await axiosInstance.post("feedback/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setIsSuccess(true);
      setStep(3);

      // Clear the auto-show timer since user submitted feedback
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      // Auto close after success
      setTimeout(() => {
        handleClose();
      }, 2500);

    } catch (error) {
      console.error("Error submitting feedback:", error);
      showAlert("Failed to submit feedback. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkipToSubmit = () => {
    if (selectedReaction?.value <= 2) {
      showAlert("Please share what went wrong so we can improve", "warning");
      return;
    }
    handleSubmit();
  };

  const getStepTitle = () => {
    switch (step) {
      case 1: return "How's your experience?";
      case 2: return selectedReaction?.value <= 2
        ? "What went wrong?"
        : "Want to share more?";
      case 3: return "Thank you!";
      default: return "";
    }
  };

  const getStepSubtitle = () => {
    switch (step) {
      case 1: return "Your feedback helps us improve";
      case 2: return selectedReaction?.value <= 2
        ? "Help us understand the issue"
        : "Optional but appreciated";
      case 3: return "Your feedback means a lot to us";
      default: return "";
    }
  };

  return (
    <>
      <AlertContainer />

      {/* Backdrop */}
      <div
        className={`fb-backdrop ${isModalOpen ? "active" : ""}`}
        onClick={handleClose}
      />

      {/* Main Container */}
      <div className={`fb-container ${isModalOpen ? "open" : ""}`}>
        {/* Decorative gradient orb */}
        <div
          className="fb-orb"
          style={{
            background: selectedReaction?.color || '#6366f1'
          }}
        />

        {/* Header */}
        <div className="fb-header">
          <div className="fb-header-content">
            <h3 className="fb-title">{getStepTitle()}</h3>
            <p className="fb-subtitle">{getStepSubtitle()}</p>
          </div>
          <button
            className="fb-close"
            onClick={handleClose}
            aria-label="Close feedback"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* Progress indicator */}
        <div className="fb-progress">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`fb-progress-dot ${step >= s ? 'active' : ''} ${step === s ? 'current' : ''}`}
              style={{
                backgroundColor: step >= s ? (selectedReaction?.color || '#6366f1') : undefined
              }}
            />
          ))}
        </div>

        {/* Content Area */}
        <div className="fb-content">
          {/* Step 1: Reaction Selection */}
          <div className={`fb-step ${step === 1 ? 'active' : ''} ${step > 1 ? 'exit-left' : ''}`}>
            <div className="fb-reactions">
              {REACTIONS.map((reaction) => (
                <button
                  key={reaction.value}
                  className={`fb-reaction ${selectedReaction?.value === reaction.value ? 'selected' : ''}`}
                  onClick={() => handleReactionSelect(reaction)}
                  onMouseEnter={() => setHoveredReaction(reaction)}
                  onMouseLeave={() => setHoveredReaction(null)}
                  style={{
                    '--reaction-color': reaction.color,
                    transform: hoveredReaction?.value === reaction.value ? 'scale(1.15) translateY(-4px)' : undefined
                  }}
                  aria-label={reaction.label}
                >
                  <span className="fb-reaction-emoji">{reaction.emoji}</span>
                  <span className="fb-reaction-label">{reaction.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Details */}
          <div className={`fb-step ${step === 2 ? 'active' : ''} ${step < 2 ? 'exit-right' : ''} ${step > 2 ? 'exit-left' : ''}`}>
            {/* Selected reaction badge */}
            {selectedReaction && (
              <div
                className="fb-selected-badge"
                style={{ backgroundColor: `${selectedReaction.color}15`, borderColor: `${selectedReaction.color}40` }}
              >
                <span>{selectedReaction.emoji}</span>
                <span style={{ color: selectedReaction.color }}>{selectedReaction.label}</span>
              </div>
            )}

            {/* Textarea */}
            <div className="fb-textarea-wrap">
              <textarea
                ref={textareaRef}
                className="fb-textarea"
                placeholder={
                  selectedReaction?.value <= 2
                    ? "Tell us what happened..."
                    : "Share your thoughts, suggestions, or report a bug..."
                }
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                disabled={isSubmitting}
                rows={4}
              />
              <div className="fb-textarea-footer">
                <span className="fb-char-count">{feedbackText.length}/500</span>
              </div>
            </div>

            {/* Image upload area */}
            <div className="fb-attachment-area">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                style={{ display: "none" }}
                disabled={isSubmitting}
              />

              {previewUrl ? (
                <div className="fb-preview">
                  <img src={previewUrl} alt="Attachment preview" />
                  <button
                    className="fb-preview-remove"
                    onClick={clearSelectedFile}
                    aria-label="Remove image"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>
              ) : (
                <button
                  className="fb-attach-btn"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSubmitting}
                >
                  <FontAwesomeIcon icon={faImage} />
                  <span>Add screenshot</span>
                </button>
              )}
            </div>

            {/* Action buttons */}
            <div className="fb-actions">
              <button
                className="fb-btn fb-btn-ghost"
                onClick={() => setStep(1)}
                disabled={isSubmitting}
              >
                <FontAwesomeIcon icon={faArrowLeft} />
                <span>Back</span>
              </button>

              <div className="fb-actions-right">
                {selectedReaction?.value > 2 && (
                  <button
                    className="fb-btn fb-btn-ghost"
                    onClick={handleSkipToSubmit}
                    disabled={isSubmitting}
                  >
                    Skip
                  </button>
                )}
                <button
                  className="fb-btn fb-btn-primary"
                  onClick={handleSubmit}
                  disabled={isSubmitting || (selectedReaction?.value <= 2 && !feedbackText.trim())}
                  style={{
                    backgroundColor: selectedReaction?.color || '#6366f1'
                  }}
                >
                  {isSubmitting ? (
                    <span className="fb-spinner" />
                  ) : (
                    <>
                      <span>Submit</span>
                      <FontAwesomeIcon icon={faArrowRight} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Step 3: Success */}
          <div className={`fb-step fb-success-step ${step === 3 ? 'active' : ''} ${step < 3 ? 'exit-right' : ''}`}>
            <div className="fb-success-content">
              <div
                className="fb-success-icon"
                style={{ backgroundColor: selectedReaction?.color || '#22c55e' }}
              >
                <FontAwesomeIcon icon={faCheck} />
              </div>
              <div className="fb-success-emoji">{selectedReaction?.emoji}</div>
              <p className="fb-success-message">
                We've received your feedback and will use it to make things better.
              </p>

              {/* Confetti particles */}
              <div className="fb-confetti">
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="fb-confetti-piece"
                    style={{
                      '--delay': `${i * 0.1}s`,
                      '--rotation': `${Math.random() * 360}deg`,
                      '--x': `${(Math.random() - 0.5) * 200}px`,
                      backgroundColor: REACTIONS[i % 5].color
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FeedbackBox;
