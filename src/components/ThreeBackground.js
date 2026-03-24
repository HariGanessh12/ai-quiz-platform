"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ThreeBackground() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0f172a, 0.002);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Clear container before appending to prevent React strict mode duplicates
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);

    // Particles setup
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 2000;
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 100;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.1,
      color: 0x3b82f6,
      transparent: true,
      opacity: 0.4, // Reduced opacity for better visibility on both themes
      blending: THREE.AdditiveBlending
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Dynamic objects
    const group = new THREE.Group();
    scene.add(group);

    const geo = new THREE.IcosahedronGeometry(1.5, 0);
    const mat = new THREE.MeshBasicMaterial({ 
      color: 0x60a5fa,
      wireframe: true,
      transparent: true,
      opacity: 0.1 // Reduced opacity
    });

    for(let i=0; i<15; i++) {
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 40
      );
      mesh.rotation.set(Math.random(), Math.random(), Math.random());
      
      // Random scaling
      const scale = Math.random() * 2 + 0.5;
      mesh.scale.set(scale, scale, scale);
      
      group.add(mesh);
    }

    let mouseX = 0;
    let mouseY = 0;

    const animate = () => {
      requestAnimationFrame(animate);

      // Rotate particles
      particlesMesh.rotation.y += 0.0005;
      particlesMesh.rotation.x += 0.0002;

      // Rotate group objects
      group.rotation.x += 0.001;
      group.rotation.y += 0.002;

      // Subtle parallax mapped to mouse movement loosely
      camera.position.x += (mouseX * 0.005 - camera.position.x) * 0.05;
      camera.position.y += (-mouseY * 0.005 - camera.position.y) * 0.05;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    const handleMouseMove = (e) => {
      mouseX = e.clientX - window.innerWidth / 2;
      mouseY = e.clientY - window.innerHeight / 2;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      if (containerRef.current && renderer.domElement) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        containerRef.current.removeChild(renderer.domElement);
      }
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      geo.dispose();
      mat.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} className="canvas-container" />;
}
