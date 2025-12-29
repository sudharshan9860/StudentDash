/**
 * Mascot3D - High-performance 3D Mascot Component
 *
 * Features:
 * - Model caching via useGLTF
 * - Animation blending with smooth transitions
 * - Lazy loading with Suspense
 * - Memory-optimized with proper cleanup
 * - Single canvas instance to prevent WebGL context loss
 *
 * @author Senior Engineer Implementation
 * @version 2.1.0
 */

import React, { useRef, useEffect, useMemo, memo, Suspense, useState, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations, OrbitControls } from '@react-three/drei';
import { useMascot } from '../contexts/MascotContext';
import * as THREE from 'three';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

// Model path constant
const MODEL_PATH = '/models/new-mascot.glb';

// Preload the model (this caches it for instant access)
useGLTF.preload(MODEL_PATH);

/**
 * Optimized Mascot Model Component
 * Handles model loading, animation, and rendering
 */
const MascotModel = memo(({
  scale = 1.5,
  position = [0, -1.5, 0],
  onLoaded
}) => {
  const group = useRef();
  const { scene, animations } = useGLTF(MODEL_PATH);
  const { actions, names, mixer } = useAnimations(animations, scene);
  const { currentAnimation, transitionDuration, loopAnimation, setIsLoaded } = useMascot();

  // Previous animation ref for smooth transitions
  const currentActionRef = useRef(null);

  // Report available animations on load
  useEffect(() => {
    if (names.length > 0) {
      console.log('[Mascot3D] Available animations:', names);
      setIsLoaded(true);
      onLoaded?.();
    }
  }, [names, setIsLoaded, onLoaded]);

  // Handle animation changes
  useEffect(() => {
    if (!actions || Object.keys(actions).length === 0) {
      console.warn('[Mascot3D] No actions available');
      return;
    }

    const targetAnimation = currentAnimation;

    // Find the action - try exact match first, then case-insensitive
    let targetAction = actions[targetAnimation];

    if (!targetAction) {
      // Try to find animation case-insensitively
      const animationKey = Object.keys(actions).find(
        key => key.toLowerCase() === targetAnimation?.toLowerCase()
      );
      if (animationKey) {
        targetAction = actions[animationKey];
      }
    }

    if (!targetAction) {
      console.warn(`[Mascot3D] Animation "${targetAnimation}" not found. Available:`, Object.keys(actions));
      // Fall back to 't-pose' or first available animation
      targetAction = actions['t-pose'] || Object.values(actions)[0];
      if (!targetAction) return;
    }

    // Stop previous animation if different
    if (currentActionRef.current && currentActionRef.current !== targetAction) {
      currentActionRef.current.fadeOut(transitionDuration);
    }

    // Configure and play target animation
    targetAction.reset();
    if (loopAnimation) {
      targetAction.setLoop(THREE.LoopRepeat, Infinity);
      targetAction.clampWhenFinished = false;
    } else {
      targetAction.setLoop(THREE.LoopOnce, 1);
      targetAction.clampWhenFinished = true;
    }
    targetAction.setEffectiveTimeScale(0.6);
    targetAction.setEffectiveWeight(1);
    targetAction.fadeIn(transitionDuration);
    targetAction.play();

    currentActionRef.current = targetAction;

    console.log(`[Mascot3D] Playing animation: ${targetAnimation}`);

  }, [currentAnimation, actions, transitionDuration, loopAnimation]);

  // Update mixer on each frame - THIS IS CRITICAL
  useFrame((state, delta) => {
    mixer?.update(delta);
  });

  return (
    <group ref={group} dispose={null}>
      <primitive
        object={scene}
        scale={scale}
        position={position}
      />
    </group>
  );
});

MascotModel.displayName = 'MascotModel';

/**
 * Loading fallback component
 */
const LoadingFallback = () => {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 2;
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial color="#667eea" wireframe />
    </mesh>
  );
};

/**
 * Main Mascot3D Container Component
 */
const Mascot3D = memo(({
  width = 200,
  height = 250,
  className = '',
  style = {},
  enableOrbitControls = false,
  backgroundColor = 'transparent',
  onLoaded,
}) => {
  const containerRef = useRef();
  const [isInView, setIsInView] = useState(true);
  const { isVisible } = useMascot();

  // Intersection Observer for visibility optimization
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Don't render if not visible
  if (!isVisible) return null;

  return (
    <div
      ref={containerRef}
      className={`mascot-3d-container ${className}`}
      style={{
        width,
        height,
        position: 'relative',
        ...style,
      }}
    >
      {isInView && (
        <Canvas
          dpr={[1, 1.5]}
          camera={{ position: [0, 0, 4], fov: 45 }}
          gl={{
            antialias: true,
            alpha: backgroundColor === 'transparent',
            powerPreference: 'default',
            stencil: false,
            depth: true,
            preserveDrawingBuffer: false,
          }}
          style={{ background: backgroundColor }}
          frameloop="always"
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 0);
          }}
        >
          {/* Lighting Setup */}
          <ambientLight intensity={0.7} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <directionalLight position={[-5, 3, -5]} intensity={0.5} />

          {/* Model with Suspense */}
          <Suspense fallback={<LoadingFallback />}>
            <MascotModel onLoaded={onLoaded} />
          </Suspense>

          {/* Optional orbit controls for debugging */}
          {enableOrbitControls && (
            <OrbitControls
              enablePan={false}
              enableZoom={true}
              minDistance={2}
              maxDistance={8}
            />
          )}
        </Canvas>
      )}
    </div>
  );
});

Mascot3D.displayName = 'Mascot3D';

/**
 * Inline Mascot - For embedding next to content
 */
export const InlineMascot = memo(({
  size = 'medium',
  className = '',
  style = {},
  onLoaded,
}) => {
  const sizes = {
    small: { width: 120, height: 150 },
    medium: { width: 180, height: 220 },
    large: { width: 250, height: 300 },
  };

  const { width, height } = sizes[size] || sizes.medium;

  return (
    <Mascot3D
      width={width}
      height={height}
      className={`inline-mascot ${className}`}
      style={{
        display: 'inline-block',
        verticalAlign: 'middle',
        ...style,
      }}
      onLoaded={onLoaded}
    />
  );
});

InlineMascot.displayName = 'InlineMascot';

/**
 * Floating Mascot - For fixed position on screen with speech bubble support
 * FAANG-level floating mascot with contextual behavior
 *
 * Features:
 * - Visibility toggle with elegant hide/show animation
 * - Persistent visibility state across page navigation
 * - Smooth transitions with cubic-bezier easing
 * - Accessible toggle button with proper ARIA labels
 */
export const FloatingMascot = memo(({
  position = 'bottom-right',
  size = 'medium',
  className = '',
  onLoaded,
  speechBubble = null,
  showBubble = false,
  onBubbleDismiss,
  bottomOffset = 0,
}) => {
  const [isBubbleVisible, setIsBubbleVisible] = useState(false);
  const [bubbleAnimating, setBubbleAnimating] = useState(false);

  // Persistent visibility state - stored in sessionStorage for page navigation persistence
  const [isMascotHidden, setIsMascotHidden] = useState(() => {
    const stored = sessionStorage.getItem('mascot_visibility_hidden');
    return stored === 'true';
  });

  // Track hover state for toggle button
  const [isToggleHovered, setIsToggleHovered] = useState(false);

  const positions = {
    'bottom-right': { bottom: 20, right: 20 },
    'bottom-left': { bottom: 20, left: 20 },
    'top-right': { top: 100, right: 20 },
    'top-left': { top: 100, left: 20 },
  };

  const sizes = {
    small: { width: 100, height: 120 },
    medium: { width: 130, height: 160 },
    large: { width: 180, height: 220 },
  };

  const positionStyle = positions[position] || positions['bottom-right'];
  const { width, height } = sizes[size] || sizes.medium;
  const isRightAligned = position.includes('right');

  // Handle visibility toggle with persistence
  const handleVisibilityToggle = useCallback(() => {
    setIsMascotHidden(prev => {
      const newValue = !prev;
      sessionStorage.setItem('mascot_visibility_hidden', String(newValue));
      return newValue;
    });
  }, []);

  // Handle speech bubble visibility
  useEffect(() => {
    if (showBubble && speechBubble) {
      setIsBubbleVisible(true);
      setBubbleAnimating(true);
    } else if (!showBubble && isBubbleVisible) {
      setBubbleAnimating(false);
      setTimeout(() => {
        setIsBubbleVisible(false);
        onBubbleDismiss?.();
      }, 300);
    }
  }, [showBubble, speechBubble, isBubbleVisible, onBubbleDismiss]);

  // Calculate final position with offset
  const finalPositionStyle = {
    ...positionStyle,
    ...(positionStyle.bottom !== undefined && { bottom: positionStyle.bottom + bottomOffset }),
  };

  return (
    <div
      className={`floating-mascot-container ${className} ${isMascotHidden ? 'mascot-hidden' : 'mascot-visible'}`}
      style={{
        position: 'fixed',
        bottom: "40vh",
        right: "5vh",
        zIndex: 1000,
      }}
    >
      {/* Visibility Toggle Button - Always visible for accessibility */}
      <button
        className={`mascot-visibility-toggle ${isToggleHovered ? 'toggle-hovered' : ''} ${isMascotHidden ? 'mascot-is-hidden' : ''}`}
        onClick={handleVisibilityToggle}
        onMouseEnter={() => setIsToggleHovered(true)}
        onMouseLeave={() => setIsToggleHovered(false)}
        onFocus={() => setIsToggleHovered(true)}
        onBlur={() => setIsToggleHovered(false)}
        aria-label={isMascotHidden ? 'Show mascot' : 'Hide mascot'}
        title={isMascotHidden ? 'Show Mascot' : 'Hide Mascot'}
        type="button"
      >
        <FontAwesomeIcon
          icon={isMascotHidden ? faEyeSlash : faEye}
          className="toggle-icon"
        />
      </button>

      {/* Speech Bubble - Only show when mascot is visible */}
      {!isMascotHidden && isBubbleVisible && speechBubble && (
        <div
          className={`speech-bubble ${isRightAligned ? 'bubble-right' : 'bubble-left'} ${bubbleAnimating ? 'bubble-visible' : 'bubble-hidden'}`}
          onClick={() => {
            setBubbleAnimating(false);
            setTimeout(() => {
              setIsBubbleVisible(false);
              onBubbleDismiss?.();
            }, 300);
          }}
        >
          <div className="bubble-content">
            {typeof speechBubble === 'string' ? (
              <span className="bubble-text">{speechBubble}</span>
            ) : (
              speechBubble
            )}
            <span className="bubble-dismiss">×</span>
          </div>
          <div className={`bubble-arrow ${isRightAligned ? 'arrow-right' : 'arrow-left'}`} />
        </div>
      )}

      {/* Mascot Container with glow effect - Animated hide/show */}
      <div className={`floating-mascot-wrapper ${isMascotHidden ? 'wrapper-hidden' : 'wrapper-visible'}`}>
        <div className="mascot-glow" />
        <Mascot3D
          width={width}
          height={height}
          onLoaded={onLoaded}
          className="floating-mascot-canvas"
        />
      </div>
    </div>
  );
});

FloatingMascot.displayName = 'FloatingMascot';

/**
 * Custom hook for managing speech bubbles
 */
export const useSpeechBubble = () => {
  const [currentBubble, setCurrentBubble] = useState(null);
  const [showBubble, setShowBubble] = useState(false);

  const showMessage = useCallback((message, duration = 4000) => {
    setCurrentBubble(message);
    setShowBubble(true);

    if (duration > 0) {
      setTimeout(() => {
        setShowBubble(false);
      }, duration);
    }
  }, []);

  const hideMessage = useCallback(() => {
    setShowBubble(false);
  }, []);

  return {
    currentBubble,
    showBubble,
    showMessage,
    hideMessage,
  };
};

export default Mascot3D;