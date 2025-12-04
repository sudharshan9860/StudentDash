// src/components/Avatar3DModel.jsx
// SAFE VERSION – FIXED ANIMATION LOOP + FBX SUPPORT

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import "./Avatar3DModel.css";

const Avatar3DModel = ({
  modelUrl = "https://models.readyplayer.me/692dee017b7a88e1f657e662.glb",
  containerType = "default",
  size = "xlarge",
  animationUrl = null,
  animationName = "idle",
}) => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const modelRef = useRef(null);
  const mixerRef = useRef(null);
  const clockRef = useRef(null);
  const cameraRef = useRef(null);
  const animationFrameRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // -----------------------------------------------------
  // SAFE ANIMATION LOOP (won't run until ready)
  // -----------------------------------------------------
  const startRenderLoop = () => {
    if (animationFrameRef.current) return; // prevent multiple loops

    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);

      if (
        !rendererRef.current ||
        !sceneRef.current ||
        !cameraRef.current ||
        !clockRef.current
      ) {
        return; // wait until everything loads
      }

      let delta = 0;
      try {
        delta = clockRef.current.getDelta();
      } catch {
        delta = 0;
      }

      if (mixerRef.current) {
        mixerRef.current.update(delta);
      }

      rendererRef.current.render(sceneRef.current, cameraRef.current);
    };

    animate();
  };

  // -----------------------------------------------------
  // MAIN EFFECT — Setup Scene, Camera, Renderer, Load Model
  // -----------------------------------------------------
  useEffect(() => {
    if (!mountRef.current) return;

    // Scene
    const scene = new THREE.Scene();
    scene.background = null;
    sceneRef.current = scene;

    // Camera config based on size
    const config = {
      small: { scale: 0.7, cameraZ: 4.0, cameraY: 0.5 },
      medium: { scale: 0.85, cameraZ: 4.5, cameraY: 0.5 },
      large: { scale: 1.0, cameraZ: 5.0, cameraY: 0.5 },
      xlarge: { scale: 1.1, cameraZ: 5.5, cameraY: 0.5 },
    }[size] || { scale: 1.1, cameraZ: 5.5, cameraY: 0.5 };

    // Camera
    const camera = new THREE.PerspectiveCamera(
      50,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, config.cameraY, config.cameraZ);
    camera.lookAt(0, 0.5, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    if (width === 0 || height === 0) {
      setError("Container width or height is zero");
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    renderer.setClearColor(0x000000, 0);
    rendererRef.current = renderer;

    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.8));

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(5, 8, 7);
    keyLight.castShadow = true;
    scene.add(keyLight);

    scene.add(new THREE.DirectionalLight(0xb8c6ff, 0.5));
    scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 0.5));

    // Clock
    clockRef.current = new THREE.Clock();

    // ---------------------
    // Load GLB Model
    // ---------------------
    const loader = new GLTFLoader();
    loader.load(
      modelUrl,
      (gltf) => {
        const model = gltf.scene;
        modelRef.current = model;

        model.scale.set(config.scale, config.scale, config.scale);

        // Center model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.x = -center.x;
        model.position.y = -box.min.y;
        model.position.z = -center.z;

        scene.add(model);

        // If animation exists → load
        if (animationUrl) {
          loadFBXAnimation(model, animationUrl);
        } else {
          setLoading(false);
          startRenderLoop();
        }
      },
      undefined,
      (error) => {
        setError("Model failed to load");
        console.error(error);
      }
    );

    // ---------------------
    // Load FBX Animation
    // ---------------------
    const loadFBXAnimation = (model, url) => {
      const fbxLoader = new FBXLoader();

      fbxLoader.load(
        url,
        (fbx) => {
          const mixer = new THREE.AnimationMixer(model);
          mixerRef.current = mixer;

          if (fbx.animations.length > 0) {
            const action = mixer.clipAction(fbx.animations[0]);
            action.reset().play();
          }

          setLoading(false);
          startRenderLoop();
        },
        undefined,
        (err) => {
          console.error("FBX Error:", err);
          setLoading(false);
          startRenderLoop();
        }
      );
    };

    // ---------------------
    // Resize Handler
    // ---------------------
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current)
        return;

      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // ---------------------
    // Cleanup
    // ---------------------
    return () => {
      window.removeEventListener("resize", handleResize);

      if (animationFrameRef.current)
        cancelAnimationFrame(animationFrameRef.current);

      if (rendererRef.current) rendererRef.current.dispose();
      mixerRef.current = null;

      if (sceneRef.current) {
        sceneRef.current.traverse((obj) => {
          if (obj.isMesh) {
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) {
              if (Array.isArray(obj.material))
                obj.material.forEach((m) => m.dispose());
              else obj.material.dispose();
            }
          }
        });
      }

      if (
        rendererRef.current &&
        mountRef.current?.contains(rendererRef.current.domElement)
      ) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
    };
  }, [modelUrl, size, animationUrl]);

  return (
    <div className={`avatar-3d-container ${size}`}>
      {loading && (
        <div className="avatar-loading">
          <div className="loading-spinner"></div>
          <p>Loading 3D Avatar…</p>
        </div>
      )}

      {error && (
        <div className="avatar-error">
          <p>{error}</p>
        </div>
      )}

      <div className="avatar-canvas-container" ref={mountRef} />

      {!loading && animationName && (
        <div className="avatar-animation-info">{animationName}</div>
      )}
    </div>
  );
};

export default Avatar3DModel;
