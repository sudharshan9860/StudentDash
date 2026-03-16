import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { X, Clock, Gift, Crown, ArrowRight, Zap, Shield, Infinity, Rocket } from "lucide-react";
import { AuthContext } from './AuthContext';
import axiosInstance from "../api/axiosInstance";

const FEATURES = [
  { icon: Zap, text: "Unlimited AI-powered learning" },
  { icon: Shield, text: "Personalized study plans" },
  { icon: Infinity, text: "Access to all courses" },
  { icon: Rocket, text: "Priority support" },
];

const TrialModal = ({
  userData = null,
}) => {
  const { username, fullName, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [totalTrialDays, setTotalTrialDays] = useState(0);
  const [isExpired, setIsExpired] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isPaid, setIsPaid] = useState(null);
  const [trialExpiryDate, setTrialExpiryDate] = useState(null);
  const [dismissed, setDismissed] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await axiosInstance.get('/api/user-info/', {
          credentials: 'include',
        });

        const data = response.data;
        setIsPaid(data.paid === true);
        setUserInfo(data);

        const expiryValue = data.trial_expiry || data.trial_expiry_date;
        if (expiryValue) {
          setTrialExpiryDate(expiryValue);

          const now = new Date();
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const expiry = new Date(expiryValue);
          const expiryDay = new Date(expiry.getFullYear(), expiry.getMonth(), expiry.getDate());

          const remaining = Math.round((expiryDay - today) / (1000 * 60 * 60 * 24));

          if (remaining <= 0) {
            setIsExpired(true);
            setDaysRemaining(0);
            setTotalTrialDays(0);
          } else {
            setDaysRemaining(remaining);
            setTotalTrialDays(remaining);
            setIsExpired(false);

            const sessionKey = `trial_dismissed_${data.username || username}`;
            if (sessionStorage.getItem(sessionKey)) {
              setDismissed(true);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
        setIsPaid(false);
      }
    };
    fetchUserInfo();
  }, [username]);

  useEffect(() => {
    if (isExpired && isPaid === false) {
      document.body.style.overflow = 'hidden';
      document.body.style.pointerEvents = 'none';
      const modal = document.querySelector('[data-trial-modal]');
      const backdrop = document.querySelector('[data-trial-backdrop]');
      if (modal) modal.style.pointerEvents = 'auto';
      if (backdrop) backdrop.style.pointerEvents = 'auto';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.pointerEvents = '';
    };
  }, [isExpired, isPaid]);

  const handleClose = () => {
    if (isExpired) return;
    setIsClosing(true);
    const sessionKey = `trial_dismissed_${userInfo?.username || username}`;
    sessionStorage.setItem(sessionKey, 'true');
    setTimeout(() => {
      setIsClosing(false);
      setDismissed(true);
    }, 250);
  };

  const handleUpgrade = () => {
    if (!isAuthenticated) {
      alert('Please login first to proceed.');
      navigate('/login');
      return;
    }

    document.body.style.overflow = '';
    document.body.style.pointerEvents = '';

    navigate('/get-started', {
      state: {
        username: username || userInfo?.username || '',
        fullName: fullName || localStorage.getItem('fullName') || userInfo?.fullname || '',
        email: userInfo?.email || '',
        phone: userInfo?.phone_number || '',
        className: userInfo?.class_name || localStorage.getItem('className') || '',
        school: userInfo?.school || localStorage.getItem('school') || '',
        trialDaysRemaining: daysRemaining,
        trialExpired: isExpired,
        trialExpiryDate: trialExpiryDate || '',
        source: 'trial_modal',
      },
    });
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

  if (isPaid === null || isPaid === true) return null;
  if (!isExpired && dismissed) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        data-trial-backdrop
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300
          ${isClosing ? 'opacity-0' : 'opacity-100'}
          ${isExpired ? 'z-[99999] cursor-not-allowed' : 'z-[10000]'}`}
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        data-trial-modal
        className={`fixed top-[5vh] left-1/2 -translate-x-1/2 w-[420px] max-w-[94vw] max-h-[90vh]
          bg-gradient-to-b from-white to-[#F8FAFC] rounded-3xl shadow-2xl p-8 overflow-hidden
          transition-all duration-300
          ${isClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
          ${isExpired ? 'z-[100000] border-2 border-red-500' : 'z-[10001]'}`}
      >
        {/* Close button */}
        {!isExpired && (
          <button
            className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-black/5 text-gray-500
              hover:bg-black/10 hover:text-gray-800 flex items-center justify-center
              transition-all duration-200 z-10"
            onClick={handleClose}
          >
            <X size={16} />
          </button>
        )}

        {/* Header */}
        <div className="text-center relative z-[1] mb-6">
          <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5
            shadow-lg ${trialMessage.urgent
              ? 'bg-gradient-to-br from-orange-500 to-red-500 shadow-red-500/50'
              : 'bg-gradient-to-br from-[#00A0E3] to-[#0080B8] shadow-[#00A0E3]/50'}`}
          >
            {isExpired ? (
              <Clock size={36} className="text-white" />
            ) : (
              <Gift size={36} className="text-white" />
            )}
          </div>

          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-amber-400 to-amber-500
            rounded-full text-xs font-bold text-gray-800 uppercase tracking-wide mb-4 shadow-md shadow-amber-500/30">
            <Crown size={12} />
            <span>Premium</span>
          </div>

          <h2 className="text-2xl font-extrabold text-[#0B1120] tracking-tight leading-tight mb-2">
            {trialMessage.title}
          </h2>
          <p className="text-base text-gray-500 font-medium">{trialMessage.subtitle}</p>
        </div>

        {/* Progress bar */}
        {!isExpired && totalTrialDays > 0 && (
          <div className="relative z-[1] mb-6">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#00A0E3] to-[#0080B8] rounded-full transition-all duration-500"
                style={{ width: `${(daysRemaining / totalTrialDays) * 100}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-400 font-medium">
              <span>{daysRemaining} days left</span>
            </div>
          </div>
        )}

        {/* Features */}
        <div className="relative z-[1] bg-gray-50 rounded-2xl p-5 mb-6">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
            {isExpired ? "Unlock these features:" : "What you get with Premium:"}
          </p>
          <ul className="space-y-3">
            {FEATURES.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <li key={index} className="flex items-center gap-3 text-sm font-medium text-gray-700">
                  <div className="w-8 h-8 rounded-lg bg-[#00A0E3] flex items-center justify-center flex-shrink-0">
                    <Icon size={14} className="text-white" />
                  </div>
                  <span>{feature.text}</span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* CTA */}
        <div className="relative z-[1] text-center">
          <button
            className={`w-full py-4 px-7 rounded-xl text-base font-bold text-white
              flex items-center justify-center gap-2.5 transition-all duration-200
              hover:-translate-y-0.5 active:translate-y-0
              ${isExpired
                ? 'bg-gradient-to-r from-orange-500 to-red-500 shadow-lg shadow-red-500/40'
                : 'bg-[#00A0E3] hover:bg-[#0080B8] shadow-lg shadow-[#00A0E3]/40'}`}
            onClick={handleUpgrade}
          >
            <span>Upgrade to Premium</span>
            <ArrowRight size={18} />
          </button>

          {!isExpired && (
            <button
              className="mt-2 px-5 py-3 text-sm font-semibold text-gray-500 hover:text-gray-700
                bg-transparent border-none cursor-pointer transition-colors duration-200"
              onClick={handleClose}
            >
              Maybe later
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default TrialModal;
