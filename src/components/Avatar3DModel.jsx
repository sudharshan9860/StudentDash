// DEBUGGING VERSION - Replace Avatar3DModel.jsx temporarily to see what's wrong
// This version has console logs to help identify the issue

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import './Avatar3DModel.css';

const Avatar3DModel = ({ 
  modelUrl = 'https://models.readyplayer.me/692dee017b7a88e1f657e662.glb', 
  containerType = 'default',
  size = 'xlarge' 
}) => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const mixerRef = useRef(null);
  const modelRef = useRef(null);
  const clockRef = useRef(new THREE.Clock());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const animationFrameRef = useRef(null);
  const [debug, setDebug] = useState('Initializing...');

  console.log('🎭 Avatar3DModel render:', { modelUrl, containerType, size, mountRef: !!mountRef.current });

  useEffect(() => {
    console.log('🚀 Avatar3DModel useEffect started');
    setDebug('Checking mount point...');
    
    if (!mountRef.current) {
      console.error('❌ mountRef.current is null!');
      setDebug('ERROR: No mount point');
      return;
    }

    console.log('✅ mountRef exists:', mountRef.current);
    setDebug('Creating scene...');

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = null;
    sceneRef.current = scene;
    console.log('✅ Scene created');

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
    console.log('✅ Camera created:', camera.position);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: "high-performance"
    });
    
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;
    console.log('📐 Container dimensions:', { width, height });
    
    if (width === 0 || height === 0) {
      console.error('❌ Container has zero dimensions!', { width, height });
      setDebug('ERROR: Container has no size');
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
    console.log('✅ Renderer created and appended');
    setDebug('Setting up lights...');

    // Lighting
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
    
    console.log('✅ Lights added');
    setDebug('Starting animation loop...');

    // Animation loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      const delta = clockRef.current.getDelta();

      if (mixerRef.current) {
        mixerRef.current.update(delta);
      }

      if (modelRef.current) {
        modelRef.current.rotation.y += 0.002;
      }

      renderer.render(scene, camera);
    };
    animate();
    console.log('✅ Animation loop started');
    setDebug('Loading model from: ' + modelUrl);

    // Load model
    const loader = new GLTFLoader();
    console.log('🔄 Loading model:', modelUrl);
    
    loader.load(
      modelUrl,
      (gltf) => {
        console.log('✅ Model loaded successfully!', gltf);
        setDebug('Model loaded! Setting up...');
        
        const model = gltf.scene;
        modelRef.current = model;

        model.scale.set(config.scale, config.scale, config.scale);
        
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        
        model.position.x = -center.x;
        model.position.y = -box.min.y;
        model.position.z = -center.z;
        
        console.log('📍 Model positioned:', model.position);
        
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
        console.log('✅ Model added to scene');

        mixerRef.current = new THREE.AnimationMixer(model);

        if (gltf.animations && gltf.animations.length > 0) {
          const action = mixerRef.current.clipAction(gltf.animations[0]);
          action.play();
          console.log('✅ Animation playing');
        }

        setLoading(false);
        setDebug('Model ready!');
        console.log('🎉 Everything ready!');
      },
      (progress) => {
        const percent = (progress.loaded / progress.total) * 100;
        console.log(`📥 Loading: ${percent.toFixed(1)}%`);
        setDebug(`Loading: ${percent.toFixed(0)}%`);
      },
      (error) => {
        console.error('❌ Error loading model:', error);
        setError('Failed to load model: ' + error.message);
        setDebug('ERROR: ' + error.message);
        setLoading(false);
      }
    );

    // Resize handler
    const handleResize = () => {
      if (!mountRef.current) return;
      
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      console.log('📐 Resize:', { width, height });

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      console.log('🧹 Cleaning up...');
      window.removeEventListener('resize', handleResize);
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      if (mixerRef.current) {
        mixerRef.current.stopAllAction();
      }

      if (rendererRef.current && mountRef.current) {
        if (rendererRef.current.domElement.parentNode === mountRef.current) {
          mountRef.current.removeChild(rendererRef.current.domElement);
        }
        rendererRef.current.dispose();
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
  }, [modelUrl, containerType, size]);

  return (
    <div className={`avatar-3d-container ${size}`} style={{ border: '2px solid red' }}>
      <div style={{ 
        position: 'absolute', 
        top: 10, 
        left: 10, 
        background: 'rgba(0,0,0,0.8)', 
        color: 'white', 
        padding: '10px',
        zIndex: 1000,
        fontSize: '12px',
        maxWidth: '300px'
      }}>
        <div>Debug: {debug}</div>
        <div>Size: {size}</div>
        <div>Type: {containerType}</div>
        <div>Loading: {loading ? 'YES' : 'NO'}</div>
        <div>Error: {error || 'None'}</div>
      </div>
      
      {loading && (
        <div className="avatar-loading">
          <div className="loading-spinner"></div>
          <p>Loading 3D Avatar...</p>
          <p style={{ fontSize: '10px', marginTop: '10px' }}>{debug}</p>
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
          transition: 'opacity 0.3s',
          border: '2px solid blue',
          minHeight: '500px'
        }}
      />
    </div>
  );
};

export default Avatar3DModel;