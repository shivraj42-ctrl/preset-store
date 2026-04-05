"use client";

import { useRef, forwardRef, useImperativeHandle } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import CameraModel from "./CameraModel";

export interface CameraSceneHandle {
  cameraARef: React.RefObject<THREE.Group | null>;
  cameraBRef: React.RefObject<THREE.Group | null>;
}

interface SceneContentProps {
  cameraAProps: {
    position: [number, number, number];
    rotation: [number, number, number];
    glowIntensity: number;
    focusRingRotation: number;
  };
  cameraBProps: {
    position: [number, number, number];
    rotation: [number, number, number];
    glowIntensity: number;
    focusRingRotation: number;
  };
  shadowOpacity: number;
}

function SceneContent({
  cameraAProps,
  cameraBProps,
  shadowOpacity,
}: SceneContentProps) {
  return (
    <>
      {/* Environment for reflections */}
      <Environment preset="studio" environmentIntensity={0.4} />

      {/* Key light — warm, from top-right-front */}
      <directionalLight
        position={[5, 8, 4]}
        intensity={1.8}
        color="#fff5e6"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.1}
        shadow-camera-far={30}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-bias={-0.0005}
      />

      {/* Fill light — cool, from left */}
      <directionalLight
        position={[-6, 3, 2]}
        intensity={0.6}
        color="#b8c4ff"
      />

      {/* Rim light — purple accent from behind (brand color) */}
      <spotLight
        position={[0, 4, -6]}
        intensity={2.5}
        color="#7c3aed"
        angle={0.6}
        penumbra={0.8}
        distance={20}
      />

      {/* Bottom fill — subtle uplight */}
      <pointLight position={[0, -3, 2]} intensity={0.3} color="#6366f1" />

      {/* Ambient base */}
      <ambientLight intensity={0.15} color="#a0a0ff" />

      {/* Camera A (left) — lens faces right (toward center) */}
      <group
        position={cameraAProps.position}
        rotation={cameraAProps.rotation}
      >
        <CameraModel
          glowIntensity={cameraAProps.glowIntensity}
          focusRingRotation={cameraAProps.focusRingRotation}
          scale={0.55}
        />
      </group>

      {/* Camera B (right) — mirrored, lens faces left */}
      <group
        position={cameraBProps.position}
        rotation={cameraBProps.rotation}
      >
        <CameraModel
          glowIntensity={cameraBProps.glowIntensity}
          focusRingRotation={cameraBProps.focusRingRotation}
          scale={0.55}
        />
      </group>

      {/* Contact shadows on floor */}
      <ContactShadows
        position={[0, -1.8, 0]}
        opacity={shadowOpacity}
        scale={16}
        blur={2.5}
        far={6}
        color="#1a0a2e"
      />

      {/* Ground reflection plane */}
      <mesh
        position={[0, -1.81, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial
          color="#0a0a0f"
          roughness={0.85}
          metalness={0.15}
          transparent
          opacity={0.5}
        />
      </mesh>
    </>
  );
}

interface CameraSceneProps {
  cameraAProps: SceneContentProps["cameraAProps"];
  cameraBProps: SceneContentProps["cameraBProps"];
  shadowOpacity: number;
}

export default function CameraScene({
  cameraAProps,
  cameraBProps,
  shadowOpacity,
}: CameraSceneProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.1,
        alpha: true,
      }}
      camera={{
        position: [0, 1.5, 7],
        fov: 40,
        near: 0.1,
        far: 100,
      }}
      style={{
        width: "100%",
        height: "100%",
        background: "transparent",
      }}
    >
      <SceneContent
        cameraAProps={cameraAProps}
        cameraBProps={cameraBProps}
        shadowOpacity={shadowOpacity}
      />
    </Canvas>
  );
}
