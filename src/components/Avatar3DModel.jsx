// src/components/Avatar3DModel.jsx
// UPDATED VERSION - FBX Animation Support
// This version loads actual FBX animation files

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import './Avatar3DModel.css';

const Avatar3DModel = ({ 
  modelUrl = 'https://models.readyplayer.me/692dee017b7a88e1f657e662.glb', 
  containerType = 'default',
  size = 'xlarge',
  animationUrl = null,
  animationName = 'idle'
}) => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const modelRef = useRef(null);
  const mixerRef = useRef(null);
  const clockRef = useRef(new THREE.Clock());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = null;
    sceneRef.current = scene;

    // Camera setup
    const config = {
      small: { scale: 0.7, cameraZ: 4.0, cameraY: 0.5 },
      medium: { scale: 0.85, cameraZ: 4.5, cameraY: 0.5 },
      large: { scale: 1.0, cameraZ: 5.0, cameraY: 0.5 },
      xlarge: { scale: 1.1, cameraZ: 5.5, cameraY: 0.5 }
    }[size] || { scale: 1.1, cameraZ: 5.5, cameraY: 0.5 };

    const camera = new THREE.PerspectiveCamera(
      50,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, config.cameraY, config.cameraZ);
    camera.lookAt(0, 0.5, 0);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: "high-performance"
    });
    
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;
    
    if (width === 0 || height === 0) {
      setError('Container has no dimensions');
      return;
    }
    
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    renderer.setClearColor(0x000000, 0);
    
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting setup (same as before)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(5, 8, 7);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xb8c6ff, 0.5);
    fillLight.position.set(-5, 3, -5);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffa8d8, 0.4);
    rimLight.position.set(0, 2, -8);
    scene.add(rimLight);

    const topLight = new THREE.DirectionalLight(0xffffff, 0.6);
    topLight.position.set(0, 10, 0);
    scene.add(topLight);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.5);
    scene.add(hemiLight);

    // Animation loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      const delta = clockRef.current.getDelta();

      // Update animation mixer if exists
      if (mixerRef.current) {
        mixerRef.current.update(delta);
      }

      // Subtle idle rotation when no animation is playing
      if (modelRef.current && !mixerRef.current) {
        modelRef.current.rotation.y += delta * 0.15;
      }

      renderer.render(scene, camera);
    };
    animate();

    // Load GLB model
    const gltfLoader = new GLTFLoader();
    
    gltfLoader.load(
      modelUrl,
      (gltf) => {
        console.log('✅ Model loaded successfully');
        
        const model = gltf.scene;
        modelRef.current = model;

        model.scale.set(config.scale, config.scale, config.scale);
        
        // Center the model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        
        model.position.x = -center.x;
        model.position.y = -box.min.y;
        model.position.z = -center.z;
        
        // Configure materials
        model.traverse((node) => {
          if (node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = false;
            if (node.material) {
              node.material.metalness = 0.05;
              node.material.roughness = 0.85;
            }
          }
        });

        scene.add(model);

        // Load FBX animation if provided
        if (animationUrl) {
          loadFBXAnimation(model, animationUrl);
        } else {
          setLoading(false);
        }
      },
      (progress) => {
        const percent = (progress.loaded / progress.total) * 100;
        console.log(`📥 Loading model: ${percent.toFixed(1)}%`);
      },
      (error) => {
        console.error('❌ Error loading model:', error);
        setError('Failed to load model');
        setLoading(false);
      }
    );

    // Function to load FBX animation
    const loadFBXAnimation = (model, fbxUrl) => {
      const fbxLoader = new FBXLoader();
      
      console.log(`🎬 Loading animation: ${fbxUrl}`);
      
      fbxLoader.load(
        fbxUrl,
        (fbx) => {
          console.log('✅ Animation loaded successfully');
          
          // Create animation mixer
          const mixer = new THREE.AnimationMixer(model);
          mixerRef.current = mixer;
          
          // Get the animation from the FBX
          if (fbx.animations && fbx.animations.length > 0) {
            const animation = fbx.animations[0];
            const action = mixer.clipAction(animation);
            
            // Play the animation
            action.play();
            console.log(`▶️ Playing animation: ${animationName}`);
          } else {
            console.warn('⚠️ No animations found in FBX file');
          }
          
          setLoading(false);
        },
        (progress) => {
          const percent = (progress.loaded / progress.total) * 100;
          console.log(`📥 Loading animation: ${percent.toFixed(1)}%`);
        },
        (error) => {
          console.error('❌ Error loading animation:', error);
          console.error('Animation URL:', fbxUrl);
          setError(`Failed to load animation from ${fbxUrl}`);
          setLoading(false);
        }
      );
    };

    // Resize handler
    const handleResize = () => {
      if (!mountRef.current) return;
      
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      if (mixerRef.current) {
        mixerRef.current.stopAllAction();
        mixerRef.current = null;
      }

      if (rendererRef.current && mountRef.current?.contains(rendererRef.current.domElement)) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }

      if (sceneRef.current) {
        sceneRef.current.traverse((object) => {
          if (object.geometry) object.geometry.dispose();
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach(material => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        });
      }
    };
  }, [modelUrl, containerType, size, animationUrl, animationName]);

  return (
    <div className={`avatar-3d-container ${size}`}>
      {loading && (
        <div className="avatar-loading">
          <div className="loading-spinner"></div>
          <p>Loading 3D Avatar...</p>
        </div>
      )}
      
      {error && (
        <div className="avatar-error">
          <p>{error}</p>
        </div>
      )}
      
      <div 
        ref={mountRef} 
        className="avatar-canvas-container"
        style={{ 
          opacity: loading ? 0 : 1, 
          transition: 'opacity 0.3s'
        }}
      />
      
      {animationName && !loading && (
        <div className="avatar-animation-info">
          {animationName}
        </div>
      )}
    </div>
  );
};

export default Avatar3DModel;