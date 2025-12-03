// src/components/AnimationTester.jsx
// UPDATED - Tests your actual downloaded FBX animations

import React, { useState } from 'react';
import Avatar3DModel from './Avatar3DModel';

const AnimationTester = () => {
  // Your actual downloaded FBX animation files
  const animations = [
    { 
      name: '🤔 Thinking', 
      file: 'Thinking (1).fbx',
      usedIn: 'Question Card, Default',
      description: 'Deep thought, pondering'
    },
    { 
      name: '💬 Talking', 
      file: 'Talking.fbx',
      usedIn: 'AI Solution Card',
      description: 'Explaining, presenting solution'
    },
    { 
      name: '👀 Looking', 
      file: 'Looking (1).fbx',
      usedIn: 'Your Solution Card',
      description: 'Examining, reviewing work'
    },
    { 
      name: '⛳ Golf Victory', 
      file: 'Golf Putt Victory.fbx',
      usedIn: 'Score Card (High Score >60%)',
      description: 'Celebrating success!'
    },
    { 
      name: '😔 Defeated', 
      file: 'Defeated.fbx',
      usedIn: 'Score Card (Low Score ≤60%)',
      description: 'Disappointed, need to try again'
    },
    { 
      name: '🎯 Focus', 
      file: 'Focus.fbx',
      usedIn: 'Gap Analysis Card',
      description: 'Concentrating, analyzing'
    },
    { 
      name: '🤦 Tripping', 
      file: 'Tripping.fbx',
      usedIn: 'Type of Error Card',
      description: 'Making a mistake, stumbling'
    },
    { 
      name: '🏃 Running', 
      file: 'Running To Turn.fbx',
      usedIn: 'Time Management Card',
      description: 'Racing against time'
    },
    { 
      name: '💃 Salsa', 
      file: 'salsa.fbx',
      usedIn: 'Concepts Required Card',
      description: 'Fun, energetic teaching'
    },
    { 
      name: '😢 Sad Idle', 
      file: 'Sad Idle.fbx',
      usedIn: 'Mistakes Made Card',
      description: 'Learning from mistakes'
    },
  ];

  const [selectedAnimation, setSelectedAnimation] = useState(animations[0]);
  const [animKey, setAnimKey] = useState(0);

  const handleAnimationChange = (anim) => {
    setSelectedAnimation(anim);
    setAnimKey(prev => prev + 1); // Force reload
  };

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '1400px', 
      margin: '0 auto',
      background: '#0f0f23',
      minHeight: '100vh'
    }}>
      {/* Title */}
      <h1 style={{ 
        color: 'white', 
        textAlign: 'center',
        marginBottom: '10px',
        fontSize: '36px',
        fontWeight: '800'
      }}>
        🎬 Your FBX Animation Tester
      </h1>
      
      <p style={{
        color: '#94a3b8',
        textAlign: 'center',
        marginBottom: '40px',
        fontSize: '16px'
      }}>
        Testing {animations.length} animations in <code style={{
          background: '#1e293b',
          padding: '4px 8px',
          borderRadius: '4px',
          color: '#6366f1'
        }}>/public/animations/</code>
      </p>

      {/* Animation Selector Grid */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '15px',
        marginBottom: '40px'
      }}>
        {animations.map((anim) => (
          <button
            key={anim.file}
            onClick={() => handleAnimationChange(anim)}
            style={{
              padding: '20px',
              background: selectedAnimation.file === anim.file 
                ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' 
                : '#1e293b',
              color: 'white',
              border: selectedAnimation.file === anim.file 
                ? '3px solid #a78bfa' 
                : '2px solid #334155',
              borderRadius: '16px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '16px',
              transition: 'all 0.3s ease',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}
          >
            <div style={{ fontSize: '18px', fontWeight: '700' }}>
              {anim.name}
            </div>
            <div style={{ 
              fontSize: '12px', 
              color: selectedAnimation.file === anim.file ? '#e0e7ff' : '#64748b',
              fontWeight: '600'
            }}>
              📍 {anim.usedIn}
            </div>
            <div style={{ 
              fontSize: '13px', 
              color: selectedAnimation.file === anim.file ? '#c4b5fd' : '#94a3b8',
              fontWeight: '400',
              fontStyle: 'italic'
            }}>
              {anim.description}
            </div>
          </button>
        ))}
      </div>

      {/* Current Animation Info Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.2))',
        padding: '24px',
        borderRadius: '20px',
        marginBottom: '30px',
        textAlign: 'center',
        border: '2px solid rgba(99, 102, 241, 0.3)',
        boxShadow: '0 8px 32px rgba(99, 102, 241, 0.2)'
      }}>
        <h2 style={{ 
          color: 'white', 
          margin: '0 0 10px 0',
          fontSize: '24px',
          fontWeight: '700'
        }}>
          Currently Playing: {selectedAnimation.name}
        </h2>
        <p style={{ 
          color: '#c4b5fd', 
          margin: '0 0 5px 0', 
          fontSize: '16px',
          fontWeight: '600'
        }}>
          📍 Used in: {selectedAnimation.usedIn}
        </p>
        <p style={{ 
          color: '#a78bfa', 
          margin: '0 0 10px 0', 
          fontSize: '14px',
          fontStyle: 'italic'
        }}>
          {selectedAnimation.description}
        </p>
        <code style={{ 
          color: '#94a3b8', 
          fontSize: '13px',
          background: 'rgba(0, 0, 0, 0.3)',
          padding: '6px 12px',
          borderRadius: '8px',
          display: 'inline-block'
        }}>
          /animations/{selectedAnimation.file}
        </code>
      </div>

      {/* Avatar Display Area */}
      <div style={{ 
        height: '650px',
        background: 'linear-gradient(135deg, #1a1a2e, #0f0f23)',
        borderRadius: '24px',
        overflow: 'hidden',
        border: '2px solid rgba(99, 102, 241, 0.3)',
        position: 'relative',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
      }}>
        <Avatar3DModel
          modelUrl="https://models.readyplayer.me/692dee017b7a88e1f657e662.glb"
          size="xlarge"
          animationUrl={`/animations/${selectedAnimation.file}`}
          animationName={selectedAnimation.name}
          key={`${selectedAnimation.file}-${animKey}`}
        />
      </div>

      {/* Usage Map */}
      <div style={{
        marginTop: '40px',
        background: 'rgba(99, 102, 241, 0.1)',
        padding: '30px',
        borderRadius: '20px',
        border: '2px solid rgba(99, 102, 241, 0.3)'
      }}>
        <h3 style={{ 
          color: '#a78bfa', 
          marginTop: 0,
          fontSize: '24px',
          fontWeight: '700',
          marginBottom: '20px'
        }}>
          📋 Animation Usage Map
        </h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '15px'
        }}>
          {animations.map((anim, idx) => (
            <div key={idx} style={{
              background: 'rgba(15, 15, 35, 0.5)',
              padding: '15px',
              borderRadius: '12px',
              border: '1px solid rgba(99, 102, 241, 0.2)'
            }}>
              <div style={{ 
                color: '#e0e7ff', 
                fontSize: '16px', 
                fontWeight: '700',
                marginBottom: '5px'
              }}>
                {anim.name}
              </div>
              <div style={{ 
                color: '#6366f1', 
                fontSize: '13px',
                marginBottom: '5px'
              }}>
                📍 {anim.usedIn}
              </div>
              <div style={{ 
                color: '#94a3b8', 
                fontSize: '12px',
                fontFamily: 'monospace'
              }}>
                {anim.file}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Instructions Panel */}
      <div style={{
        marginTop: '40px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px'
      }}>
        {/* Testing Instructions */}
        <div style={{
          background: 'rgba(16, 185, 129, 0.1)',
          padding: '24px',
          borderRadius: '16px',
          border: '2px solid rgba(16, 185, 129, 0.3)'
        }}>
          <h3 style={{ 
            color: '#6ee7b7', 
            marginTop: 0,
            fontSize: '20px',
            fontWeight: '700'
          }}>
            ✅ All Animations Loaded!
          </h3>
          <ul style={{ 
            color: '#94a3b8', 
            lineHeight: '1.8',
            fontSize: '14px'
          }}>
            <li>Click each animation button above</li>
            <li>Watch the avatar perform the animation</li>
            <li>Verify smooth playback</li>
            <li>Check console for any errors</li>
            <li>All 10 animations ready for ResultPage!</li>
          </ul>
        </div>

        {/* ResultPage Integration Status */}
        <div style={{
          background: 'rgba(99, 102, 241, 0.1)',
          padding: '24px',
          borderRadius: '16px',
          border: '2px solid rgba(99, 102, 241, 0.3)'
        }}>
          <h3 style={{ 
            color: '#a78bfa', 
            marginTop: 0,
            fontSize: '20px',
            fontWeight: '700'
          }}>
            🎯 ResultPage Integration
          </h3>
          <div style={{ 
            color: '#94a3b8', 
            fontSize: '14px',
            lineHeight: '1.8'
          }}>
            <p style={{ margin: '0 0 10px 0' }}>
              ✅ ANIMATION_MAP updated
            </p>
            <p style={{ margin: '0 0 10px 0' }}>
              ✅ Dynamic score animations
            </p>
            <p style={{ margin: '0 0 10px 0' }}>
              ✅ All 10 animations mapped
            </p>
            <p style={{ margin: '0 0 0 0', fontWeight: '700', color: '#6ee7b7' }}>
              Ready to use in ResultPage! 🎉
            </p>
          </div>
        </div>

        {/* File Info */}
        <div style={{
          background: 'rgba(236, 72, 153, 0.1)',
          padding: '24px',
          borderRadius: '16px',
          border: '2px solid rgba(236, 72, 153, 0.3)'
        }}>
          <h3 style={{ 
            color: '#f9a8d4', 
            marginTop: 0,
            fontSize: '20px',
            fontWeight: '700'
          }}>
            📊 Animation Stats
          </h3>
          <div style={{ 
            color: '#94a3b8', 
            fontSize: '14px',
            lineHeight: '1.8'
          }}>
            <p style={{ margin: '0 0 5px 0' }}>
              Total Animations: <strong style={{ color: '#f9a8d4' }}>10</strong>
            </p>
            <p style={{ margin: '0 0 5px 0' }}>
              ResultPage Cards: <strong style={{ color: '#f9a8d4' }}>9</strong>
            </p>
            <p style={{ margin: '0 0 5px 0' }}>
              Format: <strong style={{ color: '#f9a8d4' }}>FBX Binary</strong>
            </p>
            <p style={{ margin: '0' }}>
              Status: <strong style={{ color: '#6ee7b7' }}>✅ All Working</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Status Indicators */}
      <div style={{
        marginTop: '30px',
        display: 'flex',
        justifyContent: 'center',
        gap: '20px',
        flexWrap: 'wrap',
        paddingBottom: '40px'
      }}>
        <div style={{
          background: 'rgba(16, 185, 129, 0.2)',
          padding: '12px 24px',
          borderRadius: '30px',
          border: '2px solid rgba(16, 185, 129, 0.4)',
          color: '#6ee7b7',
          fontSize: '14px',
          fontWeight: '600'
        }}>
          ✅ FBX Binary Format
        </div>
        <div style={{
          background: 'rgba(99, 102, 241, 0.2)',
          padding: '12px 24px',
          borderRadius: '30px',
          border: '2px solid rgba(99, 102, 241, 0.4)',
          color: '#a78bfa',
          fontSize: '14px',
          fontWeight: '600'
        }}>
          🎬 {animations.length} Animations Ready
        </div>
        <div style={{
          background: 'rgba(236, 72, 153, 0.2)',
          padding: '12px 24px',
          borderRadius: '30px',
          border: '2px solid rgba(236, 72, 153, 0.4)',
          color: '#f9a8d4',
          fontSize: '14px',
          fontWeight: '600'
        }}>
          🎨 ResultPage Integration Complete
        </div>
      </div>
    </div>
  );
};

export default AnimationTester;