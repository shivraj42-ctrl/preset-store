"use client";

import { useRef, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";

interface CameraModelProps {
  glowIntensity?: number;
  focusRingRotation?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

export default function CameraModel({
  glowIntensity = 0,
  focusRingRotation = 0,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
}: CameraModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const focusRingRef = useRef<THREE.Group>(null);
  const lensGlassRef = useRef<THREE.Mesh>(null);

  // Materials
  const bodyMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#1a1a1a"),
        roughness: 0.35,
        metalness: 0.1,
      }),
    []
  );

  const gripMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#0d0d0d"),
        roughness: 0.85,
        metalness: 0.0,
      }),
    []
  );

  const metalMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#c0c0c0"),
        roughness: 0.15,
        metalness: 0.9,
      }),
    []
  );

  const darkMetalMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#2a2a2a"),
        roughness: 0.2,
        metalness: 0.8,
      }),
    []
  );

  const redAccent = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#cc0000"),
        roughness: 0.3,
        metalness: 0.4,
        emissive: new THREE.Color("#660000"),
        emissiveIntensity: 0.3,
      }),
    []
  );

  const glassMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color("#0a1628"),
        roughness: 0.05,
        metalness: 0.1,
        transmission: 0.6,
        thickness: 0.5,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        ior: 1.5,
      }),
    []
  );

  // Animate glow
  useFrame(() => {
    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.2 + glowIntensity * 2.5;
      mat.opacity = 0.3 + glowIntensity * 0.7;
    }
    if (focusRingRef.current) {
      focusRingRef.current.rotation.z = focusRingRotation;
    }
    if (lensGlassRef.current) {
      const mat = lensGlassRef.current.material as THREE.MeshPhysicalMaterial;
      mat.emissive = new THREE.Color("#1a3a6a");
      mat.emissiveIntensity = glowIntensity * 0.8;
    }
  });

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      scale={scale}
    >
      {/* ===== CAMERA BODY ===== */}
      <RoundedBox
        args={[2.4, 1.6, 1.3]}
        radius={0.08}
        smoothness={4}
        material={bodyMaterial}
        position={[0, 0, 0]}
        castShadow
        receiveShadow
      />

      {/* Body top bevel */}
      <RoundedBox
        args={[2.4, 0.1, 1.3]}
        radius={0.04}
        smoothness={4}
        position={[0, 0.85, 0]}
      >
        <meshStandardMaterial color="#222222" roughness={0.2} metalness={0.6} />
      </RoundedBox>

      {/* ===== VIEWFINDER HUMP ===== */}
      <RoundedBox
        args={[0.9, 0.55, 0.8]}
        radius={0.06}
        smoothness={4}
        material={bodyMaterial}
        position={[0, 1.1, 0.05]}
        castShadow
      />

      {/* Viewfinder eyepiece */}
      <mesh position={[0, 1.1, 0.45]}>
        <boxGeometry args={[0.45, 0.3, 0.12]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.9} metalness={0.0} />
      </mesh>

      {/* Viewfinder eyecup rubber */}
      <mesh position={[0, 1.1, 0.52]}>
        <boxGeometry args={[0.5, 0.35, 0.04]} />
        <meshStandardMaterial color="#050505" roughness={1.0} metalness={0.0} />
      </mesh>

      {/* ===== GRIP ===== */}
      <RoundedBox
        args={[0.55, 1.55, 1.4]}
        radius={0.1}
        smoothness={4}
        material={gripMaterial}
        position={[-1.15, -0.05, 0.05]}
        castShadow
      />

      {/* Grip texture lines */}
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={`grip-line-${i}`} position={[-1.44, -0.5 + i * 0.22, 0.05]}>
          <boxGeometry args={[0.02, 0.12, 1.2]} />
          <meshStandardMaterial
            color="#151515"
            roughness={0.95}
            metalness={0.0}
          />
        </mesh>
      ))}

      {/* ===== RED ACCENT LINE (Canon signature) ===== */}
      <mesh position={[-0.82, 0.3, -0.66]}>
        <boxGeometry args={[0.08, 0.5, 0.02]} />
        <primitive object={redAccent} attach="material" />
      </mesh>

      {/* ===== TOP PLATE ===== */}
      {/* Mode dial */}
      <mesh position={[-0.7, 1.0, 0]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 0.2, 24]} />
        <primitive object={darkMetalMaterial} attach="material" />
      </mesh>

      {/* Mode dial top ring */}
      <mesh position={[-0.7, 1.12, 0]}>
        <cylinderGeometry args={[0.27, 0.27, 0.04, 24]} />
        <primitive object={metalMaterial} attach="material" />
      </mesh>

      {/* Mode dial notches */}
      {Array.from({ length: 12 }).map((_, i) => (
        <mesh
          key={`dial-notch-${i}`}
          position={[
            -0.7 + Math.cos((i * Math.PI * 2) / 12) * 0.22,
            1.15,
            Math.sin((i * Math.PI * 2) / 12) * 0.22,
          ]}
        >
          <boxGeometry args={[0.02, 0.02, 0.02]} />
          <meshStandardMaterial color="#888888" metalness={0.9} roughness={0.1} />
        </mesh>
      ))}

      {/* Shutter button */}
      <mesh position={[-0.95, 1.0, -0.35]}>
        <cylinderGeometry args={[0.1, 0.1, 0.08, 16]} />
        <primitive object={metalMaterial} attach="material" />
      </mesh>

      {/* Shutter button top */}
      <mesh position={[-0.95, 1.05, -0.35]}>
        <cylinderGeometry args={[0.08, 0.08, 0.03, 16]} />
        <meshStandardMaterial color="#e0e0e0" roughness={0.1} metalness={0.95} />
      </mesh>

      {/* Hot shoe */}
      <mesh position={[0, 1.38, 0]}>
        <boxGeometry args={[0.5, 0.06, 0.4]} />
        <primitive object={metalMaterial} attach="material" />
      </mesh>

      {/* Hot shoe rails */}
      <mesh position={[0, 1.35, -0.15]}>
        <boxGeometry args={[0.55, 0.04, 0.06]} />
        <primitive object={metalMaterial} attach="material" />
      </mesh>
      <mesh position={[0, 1.35, 0.15]}>
        <boxGeometry args={[0.55, 0.04, 0.06]} />
        <primitive object={metalMaterial} attach="material" />
      </mesh>

      {/* ===== LCD SCREEN (back) ===== */}
      <mesh position={[0.15, -0.1, 0.66]}>
        <boxGeometry args={[1.5, 1.0, 0.04]} />
        <meshStandardMaterial color="#050505" roughness={0.3} metalness={0.1} />
      </mesh>

      {/* LCD bezel */}
      <mesh position={[0.15, -0.1, 0.65]}>
        <boxGeometry args={[1.55, 1.05, 0.02]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.4} metalness={0.3} />
      </mesh>

      {/* ===== LENS MOUNT RING ===== */}
      <mesh position={[0, 0, -0.66]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.58, 0.04, 8, 32]} />
        <primitive object={metalMaterial} attach="material" />
      </mesh>

      {/* ===== LENS BARREL ===== */}
      {/* Main lens tube */}
      <mesh position={[0, 0, -1.3]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.55, 0.52, 1.3, 32]} />
        <meshStandardMaterial color="#1e1e1e" roughness={0.4} metalness={0.2} />
      </mesh>

      {/* Lens outer barrel */}
      <mesh position={[0, 0, -1.0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.58, 0.56, 0.7, 32]} />
        <meshStandardMaterial color="#161616" roughness={0.5} metalness={0.15} />
      </mesh>

      {/* Focus ring group (animated) */}
      <group ref={focusRingRef} position={[0, 0, -1.15]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.6, 0.6, 0.3, 32]} />
          <meshStandardMaterial
            color="#252525"
            roughness={0.7}
            metalness={0.1}
          />
        </mesh>

        {/* Focus ring grip ridges */}
        {Array.from({ length: 40 }).map((_, i) => (
          <mesh
            key={`focus-ridge-${i}`}
            position={[
              Math.cos((i * Math.PI * 2) / 40) * 0.61,
              Math.sin((i * Math.PI * 2) / 40) * 0.61,
              0,
            ]}
            rotation={[0, 0, (i * Math.PI * 2) / 40]}
          >
            <boxGeometry args={[0.02, 0.015, 0.28]} />
            <meshStandardMaterial
              color="#1a1a1a"
              roughness={0.8}
              metalness={0.05}
            />
          </mesh>
        ))}
      </group>

      {/* Zoom ring */}
      <mesh position={[0, 0, -0.85]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.57, 0.57, 0.2, 32]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.6} metalness={0.15} />
      </mesh>

      {/* Zoom ring rubber texture */}
      {Array.from({ length: 30 }).map((_, i) => (
        <mesh
          key={`zoom-ridge-${i}`}
          position={[
            Math.cos((i * Math.PI * 2) / 30) * 0.575,
            Math.sin((i * Math.PI * 2) / 30) * 0.575,
            -0.85,
          ]}
          rotation={[0, 0, (i * Math.PI * 2) / 30]}
        >
          <boxGeometry args={[0.015, 0.01, 0.18]} />
          <meshStandardMaterial
            color="#1f1f1f"
            roughness={0.85}
            metalness={0.0}
          />
        </mesh>
      ))}

      {/* Metal accent ring near front */}
      <mesh position={[0, 0, -1.55]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.52, 0.02, 8, 32]} />
        <primitive object={metalMaterial} attach="material" />
      </mesh>

      {/* Red accent ring on lens (Canon L-series signature) */}
      <mesh position={[0, 0, -1.48]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.54, 0.015, 8, 32]} />
        <primitive object={redAccent} attach="material" />
      </mesh>

      {/* Lens hood / front element ring */}
      <mesh position={[0, 0, -1.7]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.5, 0.54, 0.35, 32]} />
        <meshStandardMaterial color="#141414" roughness={0.5} metalness={0.2} />
      </mesh>

      {/* Front filter thread */}
      <mesh position={[0, 0, -1.88]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.48, 0.02, 8, 32]} />
        <primitive object={darkMetalMaterial} attach="material" />
      </mesh>

      {/* ===== LENS GLASS (front element) ===== */}
      <mesh ref={lensGlassRef} position={[0, 0, -1.85]} rotation={[0, 0, 0]}>
        <circleGeometry args={[0.44, 32]} />
        <primitive object={glassMaterial} attach="material" />
      </mesh>

      {/* Inner lens elements (visible through glass) */}
      <mesh position={[0, 0, -1.82]}>
        <circleGeometry args={[0.3, 32]} />
        <meshStandardMaterial
          color="#0a0f1e"
          roughness={0.1}
          metalness={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Aperture blades (decorative) */}
      <mesh position={[0, 0, -1.8]}>
        <ringGeometry args={[0.15, 0.28, 8]} />
        <meshStandardMaterial
          color="#050505"
          roughness={0.3}
          metalness={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* ===== LENS GLOW RING ===== */}
      <mesh ref={glowRef} position={[0, 0, -1.9]} rotation={[0, 0, 0]}>
        <ringGeometry args={[0.42, 0.5, 32]} />
        <meshStandardMaterial
          color="#6366f1"
          emissive={new THREE.Color("#6366f1")}
          emissiveIntensity={0.2}
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* ===== BOTTOM PLATE ===== */}
      <mesh position={[0, -0.82, 0]}>
        <boxGeometry args={[2.4, 0.04, 1.3]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.3} metalness={0.4} />
      </mesh>

      {/* Tripod mount */}
      <mesh position={[0.2, -0.86, 0]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.04, 16]} />
        <primitive object={metalMaterial} attach="material" />
      </mesh>

      {/* ===== CANON TEXT (decorative line) ===== */}
      <mesh position={[0.3, 0.65, -0.66]}>
        <boxGeometry args={[0.8, 0.04, 0.01]} />
        <meshStandardMaterial color="#888888" roughness={0.2} metalness={0.8} />
      </mesh>

      {/* ===== EOS R5 MODEL NAME (decorative line) ===== */}
      <mesh position={[0.5, 0.55, -0.66]}>
        <boxGeometry args={[0.5, 0.025, 0.01]} />
        <meshStandardMaterial color="#666666" roughness={0.3} metalness={0.7} />
      </mesh>
    </group>
  );
}
