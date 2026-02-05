import React, { useState, useEffect, useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faCrown,
  faRocket,
  faCheck,
  faClock,
  faGift,
  faArrowRight,
  faShieldAlt,
  faBolt,
  faInfinity,
} from "@fortawesome/free-solid-svg-icons";
import "./TrialModal.css";
import { AuthContext } from './AuthContext';
import axiosInstance from "../api/axiosInstance";

const FEATURES = [
  { icon: faBolt, text: "Unlimited AI-powered learning" },
  { icon: faShieldAlt, text: "Personalized study plans" },
  { icon: faInfinity, text: "Access to all courses" },
  { icon: faRocket, text: "Priority support" },
];

const TrialModal = ({
  isOpen = false,
  onClose = () => {},
  trialStartDate = null, // Pass the date when trial started
  trialDays = 7,
  redirectUrl = "https://smartlearners.ai/get-started",
  // Data to send with redirect
  userData = null, // { username, email, fullName, class, plan, etc. }
}) => {
  const { username, fullName } = useContext(AuthContext);
  const [daysRemaining, setDaysRemaining] = useState(trialDays);
  const [isExpired, setIsExpired] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isPaid, setIsPaid] = useState(null); // null = loading, true/false = loaded

  // Fetch user info to check paid status
  useEffect(() => {
    if (isOpen) {
      const fetchUserInfo = async () => {
        try {
          const response = await axiosInstance.get('/api/user-info/', {
            credentials: 'include',
          });

            const data = await response.data;
            setIsPaid(data.paid === true);
        
        } catch (error) {
          console.error('Error fetching user info:', error);
          setIsPaid(false); // Show modal if API fails
        }
      };
      fetchUserInfo();
    }
  }, [isOpen]);

  useEffect(() => {
    if (trialStartDate) {
      const start = new Date(trialStartDate);
      const now = new Date();
      const diffTime = now - start;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const remaining = trialDays - diffDays;

      if (remaining <= 0) {
        setIsExpired(true);
        setDaysRemaining(0);
      } else {
        setDaysRemaining(remaining);
        setIsExpired(false);
      }
    }
  }, [trialStartDate, trialDays, isOpen]);

  const handleClose = () => {
    if (isExpired) return; // Can't close if expired
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 250);
  };

  const handleUpgrade = () => {
    // Build URL with query parameters
    const url = new URL(redirectUrl);

    // Add user data as query parameters
    const dataToSend = {
      // Default data from AuthContext
      username: username || '',
      fullName: fullName || localStorage.getItem('fullName') || '',
      // Trial info
      trialDaysRemaining: daysRemaining,
      trialExpired: isExpired,
      trialStartDate: trialStartDate || '',
      // Timestamp
      timestamp: new Date().toISOString(),
      // Source tracking
      source: 'trial_modal',
      // Merge with any custom userData passed as prop
      ...userData,
    };

    // Add each parameter to URL
    Object.entries(dataToSend).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        url.searchParams.append(key, String(value));
      }
    });

    // Open the URL with parameters
    window.open(url.toString(), '_blank', 'noopener,noreferrer');
  };

  const getTrialMessage = () => {
    if (isExpired) {
      return {
        title: "Your Free Trial Has Ended",
        subtitle: "Upgrade now to continue your learning journey",
        urgent: true
      };
    }
    if (daysRemaining <= 2) {
      return {
        title: `Only ${daysRemaining} day${daysRemaining === 1 ? '' : 's'} left!`,
        subtitle: "Don't lose your progress - upgrade today",
        urgent: true
      };
    }
    return {
      title: `${daysRemaining} days remaining`,
      subtitle: "You're on your free trial",
      urgent: false
    };
  };

  const trialMessage = getTrialMessage();

  // Don't show if not open, still loading, or user has paid
  if (!isOpen || isPaid === null || isPaid === true) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`trial-backdrop ${isClosing ? 'closing' : ''}`}
        onClick={handleClose}
      />

      {/* Modal */}
      <div className={`trial-modal ${isClosing ? 'closing' : ''} ${isExpired ? 'expired' : ''}`}>
        {/* Decorative elements */}
        <div className="trial-glow trial-glow-1" />
        <div className="trial-glow trial-glow-2" />

        {/* Close button - only if not expired */}
        {!isExpired && (
          <button className="trial-close" onClick={handleClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        )}

        {/* Header */}
        <div className="trial-header">
          <div className={`trial-icon-wrap ${trialMessage.urgent ? 'urgent' : ''}`}>
            {isExpired ? (
              <FontAwesomeIcon icon={faClock} className="trial-icon" />
            ) : (
              <FontAwesomeIcon icon={faGift} className="trial-icon" />
            )}
          </div>

          <div className="trial-badge">
            <FontAwesomeIcon icon={faCrown} />
            <span>Premium</span>
          </div>

          <h2 className="trial-title">{trialMessage.title}</h2>
          <p className="trial-subtitle">{trialMessage.subtitle}</p>
        </div>

        {/* Progress bar - only show if not expired */}
        {!isExpired && (
          <div className="trial-progress-wrap">
            <div className="trial-progress-bar">
              <div
                className="trial-progress-fill"
                style={{ width: `${((trialDays - daysRemaining) / trialDays) * 100}%` }}
              />
            </div>
            <div className="trial-progress-labels">
              <span>Day 1</span>
              <span>Day {trialDays}</span>
            </div>
          </div>
        )}

        {/* Features */}
        <div className="trial-features">
          <p className="trial-features-title">
            {isExpired ? "Unlock these features:" : "What you get with Premium:"}
          </p>
          <ul className="trial-features-list">
            {FEATURES.map((feature, index) => (
              <li key={index} className="trial-feature-item">
                <div className="trial-feature-icon">
                  <FontAwesomeIcon icon={feature.icon} />
                </div>
                <span>{feature.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA Section */}
        <div className="trial-cta">
          <button className="trial-upgrade-btn" onClick={handleUpgrade}>
            <span>Upgrade to Premium</span>
            <FontAwesomeIcon icon={faArrowRight} />
          </button>

          {!isExpired && (
            <button className="trial-later-btn" onClick={handleClose}>
              Maybe later
            </button>
          )}

          <p className="trial-guarantee">
            <FontAwesomeIcon icon={faShieldAlt} />
            <span>30-day money-back guarantee</span>
          </p>
        </div>

        {/* Floating particles for visual interest */}
        <div className="trial-particles">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="trial-particle"
              style={{
                '--delay': `${i * 0.5}s`,
                '--x': `${20 + (i * 15)}%`,
                '--duration': `${3 + (i * 0.5)}s`
              }}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default TrialModal;
