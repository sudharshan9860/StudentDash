// Enhanced MotivationalQuote.jsx - Dynamic & Engaging with Time-based Content - FIXED
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faMagic, 
  faLightbulb, 
  faRocket, 
  faStar, 
  faFire, 
  faHeart,
  faBrain,
  faTrophy,
  faGem,
  faThumbsUp
} from '@fortawesome/free-solid-svg-icons';

const MotivationalQuote = () => {
  const [currentQuote, setCurrentQuote] = useState({});
  const [isVisible, setIsVisible] = useState(true);
  const [quoteIndex, setQuoteIndex] = useState(0);

  // Enhanced quotes with time-based categorization and better variety
  const quotes = {
    morning: [
      {
        text: "Good morning, scholar! Today's mathematical journey awaits your brilliant mind!",
        author: "Your AI Educator",
        icon: faMagic,
        gradient: "linear-gradient(135deg, #ff7b7b 0%, #ff9f43 100%)",
        bgColor: "rgba(255, 123, 123, 0.1)"
      },
      {
        text: "Rise and solve! Every equation you master today brings you closer to mathematical mastery!",
        author: "Morning Motivation",
        icon: faRocket,
        gradient: "linear-gradient(135deg, #3742fa 0%, #5f27cd 100%)",
        bgColor: "rgba(55, 66, 250, 0.1)"
      },
      {
        text: "Mathematics is the poetry of logical ideas - let's write beautiful solutions together!",
        author: "Albert Einstein",
        icon: faLightbulb,
        gradient: "linear-gradient(135deg, #ffa726 0%, #fb8c00 100%)",
        bgColor: "rgba(255, 167, 38, 0.1)"
      },
      {
        text: "Your brain is most powerful in the morning - perfect time to conquer complex problems!",
        author: "Learning Science",
        icon: faBrain,
        gradient: "linear-gradient(135deg, #26de81 0%, #20bf6b 100%)",
        bgColor: "rgba(38, 222, 129, 0.1)"
      }
    ],
    afternoon: [
      {
        text: "Keep the momentum going! You're building incredible mathematical intuition with every problem!",
        author: "Progress Tracker",
        icon: faFire,
        gradient: "linear-gradient(135deg, #fd79a8 0%, #e84393 100%)",
        bgColor: "rgba(253, 121, 168, 0.1)"
      },
      {
        text: "Mathematics is not about being perfect, it's about getting better every single day!",
        author: "Growth Mindset",
        icon: faStar,
        gradient: "linear-gradient(135deg, #00b894 0%, #00a085 100%)",
        bgColor: "rgba(0, 184, 148, 0.1)"
      },
      {
        text: "Every mistake is a stepping stone to mastery. You're doing amazing!",
        author: "Learning Journey",
        icon: faHeart,
        gradient: "linear-gradient(135deg, #e17055 0%, #d63031 100%)",
        bgColor: "rgba(225, 112, 85, 0.1)"
      },
      {
        text: "Persistence beats resistance. Keep solving, keep growing, keep shining!",
        author: "Afternoon Wisdom",
        icon: faGem,
        gradient: "linear-gradient(135deg, #6c5ce7 0%, #5f3dc4 100%)",
        bgColor: "rgba(108, 92, 231, 0.1)"
      }
    ],
    evening: [
      {
        text: "Evening reflection: Look how much you've learned today! Tomorrow will be even better!",
        author: "Daily Reflection",
        icon: faTrophy,
        gradient: "linear-gradient(135deg, #fdcb6e 0%, #e17055 100%)",
        bgColor: "rgba(253, 203, 110, 0.1)"
      },
      {
        text: "Mathematics is a journey, not a destination. Enjoy every step of discovery!",
        author: "Philosophical Math",
        icon: faLightbulb,
        gradient: "linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)",
        bgColor: "rgba(116, 185, 255, 0.1)"
      },
      {
        text: "Your dedication to learning in the evening shows true commitment to excellence!",
        author: "Evening Inspiration",
        icon: faThumbsUp,
        gradient: "linear-gradient(135deg, #81ecec 0%, #00b894 100%)",
        bgColor: "rgba(129, 236, 236, 0.1)"
      },
      {
        text: "As the day winds down, your mathematical understanding reaches new heights!",
        author: "Evening Growth",
        icon: faRocket,
        gradient: "linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%)",
        bgColor: "rgba(162, 155, 254, 0.1)"
      }
    ],
    motivational: [
      {
        text: "You're not just learning math - you're training your mind to think logically and solve any problem!",
        author: "Cognitive Science",
        icon: faBrain,
        gradient: "linear-gradient(135deg, #00cec9 0%, #55a3ff 100%)",
        bgColor: "rgba(0, 206, 201, 0.1)"
      },
      {
        text: "Every great mathematician started exactly where you are now. Keep going!",
        author: "Mathematical History",
        icon: faStar,
        gradient: "linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)",
        bgColor: "rgba(255, 107, 107, 0.1)"
      },
      {
        text: "Problem-solving is a superpower, and you're developing it with every equation!",
        author: "Superpower Academy",
        icon: faFire,
        gradient: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
        bgColor: "rgba(252, 182, 159, 0.1)"
      },
      {
        text: "Mathematics is the art of giving the same name to different things. You're becoming an artist!",
        author: "Henri Poincaré",
        icon: faGem,
        gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        bgColor: "rgba(102, 126, 234, 0.1)"
      },
      {
        text: "Your mathematical journey is unique and valuable. Every step forward counts!",
        author: "Personal Growth",
        icon: faHeart,
        gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
        bgColor: "rgba(240, 147, 251, 0.1)"
      }
    ],
    achievement: [
      {
        text: "🎉 Incredible! You're showing real mathematical thinking and problem-solving skills!",
        author: "Achievement Unlocked",
        icon: faTrophy,
        gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
        bgColor: "rgba(79, 172, 254, 0.1)"
      },
      {
        text: "🌟 Outstanding progress! Your persistence is paying off in amazing ways!",
        author: "Progress Celebration",
        icon: faStar,
        gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
        bgColor: "rgba(67, 233, 123, 0.1)"
      },
      {
        text: "🚀 You're not just solving problems - you're building confidence and mathematical intuition!",
        author: "Confidence Builder",
        icon: faRocket,
        gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
        bgColor: "rgba(250, 112, 154, 0.1)"
      }
    ]
  };

  // Get all quotes as a flat array for cycling
  const getAllQuotes = () => {
    return [
      ...quotes.morning,
      ...quotes.afternoon,
      ...quotes.evening,
      ...quotes.motivational,
      ...quotes.achievement
    ];
  };

  const allQuotes = getAllQuotes();

  // Get time-based quote category
  const getQuoteCategory = () => {
    const hour = new Date().getHours();
    const random = Math.random();
    
    // 20% chance for motivational/achievement quotes
    if (random < 0.15) return 'achievement';
    if (random < 0.3) return 'motivational';
    
    // Time-based selection
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    return 'evening';
  };

  // Select quote based on current index or random from category
  const selectQuote = (useIndex = false) => {
    if (useIndex) {
      return allQuotes[quoteIndex % allQuotes.length];
    } else {
      const category = getQuoteCategory();
      const categoryQuotes = quotes[category];
      const randomIndex = Math.floor(Math.random() * categoryQuotes.length);
      return categoryQuotes[randomIndex];
    }
  };

  // Smooth quote transition
  const changeQuote = () => {
    setIsVisible(false);
    setTimeout(() => {
      // Cycle through quotes or use time-based selection
      const newQuote = Math.random() < 0.7 ? selectQuote(true) : selectQuote(false);
      setCurrentQuote(newQuote);
      setQuoteIndex(prev => (prev + 1) % allQuotes.length);
      setIsVisible(true);
    }, 300);
  };

  useEffect(() => {
    // Set initial quote
    const initialQuote = selectQuote(false);
    setCurrentQuote(initialQuote);
    
    // Change quote every 8 seconds for better visibility
    const interval = setInterval(changeQuote, 8000);

    return () => clearInterval(interval);
  }, []);

  // Add click handler to manually change quote
  const handleQuoteClick = () => {
    changeQuote();
  };

  if (!currentQuote.text) return null;

  return (
    <div 
      className={`motivational-quote ${isVisible ? 'visible' : 'fade-out'}`}
      onClick={handleQuoteClick}
      style={{
        background: currentQuote.bgColor,
        border: `1px solid ${currentQuote.gradient.match(/#[a-fA-F0-9]{6}/)?.[0] || '#00BCD4'}33`,
        transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.98)',
        opacity: isVisible ? 1 : 0.7,
        cursor: 'pointer'
      }}
    >
      <div 
        className="quote-icon"
        style={{
          background: currentQuote.gradient,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
        }}
      >
        <FontAwesomeIcon icon={currentQuote.icon} />
      </div>
      
      <div className="quote-content">
        <h3 
          style={{
            background: currentQuote.gradient,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '0.5rem',
            fontWeight: '600',
            fontSize: '1.2rem',
            lineHeight: '1.5'
          }}
        >
          "{currentQuote.text}"
        </h3>
        <p style={{ 
          margin: 0, 
          color: 'var(--text-secondary)',
          fontWeight: '500',
          fontSize: '1rem' 
        }}>
          — {currentQuote.author}
        </p>
      </div>

      {/* Progress indicator */}
      <div 
        style={{
          position: 'absolute',
          bottom: '0',
          left: '0',
          height: '3px',
          background: currentQuote.gradient,
          borderRadius: '0 0 24px 24px',
          animation: 'progress-bar 8s linear infinite',
          width: '100%'
        }}
      />

      {/* Click indicator */}
      <div 
        style={{
          position: 'absolute',
          top: '10px',
          right: '15px',
          fontSize: '0.8rem',
          opacity: '0.5',
          color: 'var(--text-muted)'
        }}
      >
        Click to change
      </div>

      <style jsx>{`
        @keyframes progress-bar {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        
        .motivational-quote.fade-out {
          transform: translateY(10px) scale(0.98);
          opacity: 0.7;
        }
        
        .motivational-quote.visible {
          transform: translateY(0) scale(1);
          opacity: 1;
        }
        
        .motivational-quote:hover {
          transform: translateY(-4px) scale(1.01) !important;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1) !important;
        }
      `}</style>
    </div>
  );
};

export default MotivationalQuote;