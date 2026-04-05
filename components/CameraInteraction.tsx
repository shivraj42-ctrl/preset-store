"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";

gsap.registerPlugin(ScrollTrigger);

export default function CameraInteraction() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cameraARef = useRef<HTMLDivElement>(null);
  const cameraBRef = useRef<HTMLDivElement>(null);
  const glowCenterRef = useRef<HTMLDivElement>(null);
  const glowARef = useRef<HTMLDivElement>(null);
  const glowBRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const camA = cameraARef.current;
    const camB = cameraBRef.current;
    const glowC = glowCenterRef.current;
    const glowA = glowARef.current;
    const glowB = glowBRef.current;
    const textEl = textRef.current;
    const subtitleEl = subtitleRef.current;
    const lineEl = lineRef.current;
    const scrollInd = scrollIndicatorRef.current;
    if (!section || !camA || !camB || !glowC || !glowA || !glowB || !textEl || !subtitleEl || !lineEl || !scrollInd) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.8,
        },
      });

      /* ── Phase 1: Approach (0% → 40%) ── */
      tl.fromTo(
        camA,
        { x: "-55vw", y: 50, rotate: -12, scale: 0.7, opacity: 0 },
        { x: "-10vw", y: 0, rotate: -3, scale: 1, opacity: 1, duration: 0.4, ease: "power2.out" },
        0
      );
      tl.fromTo(
        camB,
        { x: "55vw", y: 50, rotate: 12, scale: 0.7, opacity: 0 },
        { x: "10vw", y: 0, rotate: 3, scale: 1, opacity: 1, duration: 0.4, ease: "power2.out" },
        0
      );
      tl.fromTo(glowC, { opacity: 0, scale: 0.4 }, { opacity: 0.3, scale: 1, duration: 0.4 }, 0);
      tl.fromTo(glowA, { opacity: 0, scale: 0.5 }, { opacity: 0.3, scale: 1, duration: 0.4 }, 0);
      tl.fromTo(glowB, { opacity: 0, scale: 0.5 }, { opacity: 0.3, scale: 1, duration: 0.4 }, 0);

      /* ── Phase 2: Handshake (40% → 60%) — elastic bounce ── */
      tl.to(camA, { x: "-4vw", rotate: 4, duration: 0.2, ease: "elastic.out(1.2, 0.5)" }, 0.4);
      tl.to(camB, { x: "4vw", rotate: -4, duration: 0.2, ease: "elastic.out(1.2, 0.5)" }, 0.4);
      tl.to(glowC, { opacity: 1, scale: 1.5, duration: 0.2 }, 0.4);
      tl.to(glowA, { opacity: 0.8, scale: 1.3, duration: 0.2 }, 0.4);
      tl.to(glowB, { opacity: 0.8, scale: 1.3, duration: 0.2 }, 0.4);

      /* ── Phase 3: Settle (60% → 80%) ── */
      tl.to(camA, { x: "-12vw", rotate: 0, duration: 0.2, ease: "power2.inOut" }, 0.6);
      tl.to(camB, { x: "12vw", rotate: 0, duration: 0.2, ease: "power2.inOut" }, 0.6);
      tl.to(glowC, { opacity: 0.5, scale: 1.2, duration: 0.2 }, 0.6);
      tl.to(glowA, { opacity: 0.4, scale: 1.1, duration: 0.2 }, 0.6);
      tl.to(glowB, { opacity: 0.4, scale: 1.1, duration: 0.2 }, 0.6);

      /* ── Phase 4: Hold (80% → 100%) ── */
      tl.to(camA, { duration: 0.2 }, 0.8);
      tl.to(camB, { duration: 0.2 }, 0.8);

      /* ── Text animations ── */
      tl.fromTo(
        textEl,
        { opacity: 0, y: 60, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.2, ease: "power3.out" },
        0.35
      );
      tl.fromTo(
        subtitleEl,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.15, ease: "power2.out" },
        0.45
      );
      tl.fromTo(
        lineEl,
        { width: 0, opacity: 0 },
        { width: 200, opacity: 1, duration: 0.2, ease: "power2.out" },
        0.5
      );
      tl.to(scrollInd, { opacity: 0, duration: 0.1 }, 0.85);
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="camera-interaction"
      className="relative w-full hidden md:block"
      style={{ height: "250vh" }}
    >
      {/* Sticky viewport */}
      <div
        className="sticky top-0 w-full h-screen overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse at 50% 40%, rgba(88, 28, 135, 0.08) 0%, rgba(0, 0, 0, 0) 70%)",
        }}
      >
        {/* Ambient background glows */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Left purple glow */}
          <div
            className="absolute w-[500px] h-[500px] rounded-full blur-[150px]"
            style={{
              top: "20%",
              left: "10%",
              background: "radial-gradient(circle, rgba(124, 58, 237, 0.12) 0%, transparent 70%)",
            }}
          />
          {/* Right indigo glow */}
          <div
            className="absolute w-[500px] h-[500px] rounded-full blur-[150px]"
            style={{
              top: "20%",
              right: "10%",
              background: "radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, transparent 70%)",
            }}
          />
          {/* Center glow (animated) */}
          <div
            ref={glowCenterRef}
            className="absolute w-[700px] h-[700px] rounded-full blur-[200px]"
            style={{
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: "radial-gradient(circle, rgba(139, 92, 246, 0.22) 0%, transparent 60%)",
              opacity: 0,
            }}
          />
        </div>

        {/* Film grain */}
        <div
          className="absolute inset-0 opacity-[0.02] pointer-events-none z-20"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")",
            backgroundSize: "128px",
          }}
        />

        {/* ===== CAMERA A — Square camera (left) ===== */}
        <div
          ref={cameraARef}
          className="absolute z-10"
          style={{
            top: "50%",
            left: "50%",
            width: "clamp(280px, 32vw, 460px)",
            transformOrigin: "center center",
            transform: "translate(-55vw, -50%)",
            willChange: "transform, opacity",
          }}
        >
          {/* Per-camera glow behind */}
          <div
            ref={glowARef}
            className="absolute rounded-full blur-[80px]"
            style={{
              width: "120%",
              height: "120%",
              top: "-10%",
              left: "-10%",
              background: "radial-gradient(circle, rgba(56, 189, 248, 0.18) 0%, rgba(99, 102, 241, 0.08) 50%, transparent 70%)",
              opacity: 0,
              zIndex: -1,
            }}
          />
          <Image
            src="/images/camera-square.png"
            alt="Camera"
            width={460}
            height={460}
            priority
            className="w-full h-auto select-none pointer-events-none"
            style={{
              filter: "drop-shadow(0 16px 48px rgba(0,0,0,0.5)) drop-shadow(0 4px 12px rgba(99,102,241,0.15))",
            }}
          />
        </div>

        {/* ===== CAMERA B — Compact camera (right) ===== */}
        <div
          ref={cameraBRef}
          className="absolute z-10"
          style={{
            top: "50%",
            right: "50%",
            width: "clamp(300px, 36vw, 500px)",
            transformOrigin: "center center",
            transform: "translate(55vw, -50%)",
            willChange: "transform, opacity",
          }}
        >
          {/* Per-camera glow behind */}
          <div
            ref={glowBRef}
            className="absolute rounded-full blur-[80px]"
            style={{
              width: "120%",
              height: "120%",
              top: "-10%",
              left: "-10%",
              background: "radial-gradient(circle, rgba(124, 58, 237, 0.18) 0%, rgba(139, 92, 246, 0.08) 50%, transparent 70%)",
              opacity: 0,
              zIndex: -1,
            }}
          />
          <Image
            src="/images/camera-compact.png"
            alt="Compact Camera"
            width={500}
            height={340}
            priority
            className="w-full h-auto select-none pointer-events-none"
            style={{
              filter: "drop-shadow(0 16px 48px rgba(0,0,0,0.5)) drop-shadow(0 4px 12px rgba(124,58,237,0.15))",
            }}
          />
        </div>

        {/* Text overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-[12vh] z-20 pointer-events-none">
          <h2
            ref={textRef}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-center leading-[1.05] tracking-tight"
            style={{ opacity: 0 }}
          >
            <span className="block text-white drop-shadow-[0_0_40px_rgba(139,92,246,0.3)]">
              Elevate
            </span>
            <span className="block bg-gradient-to-r from-purple-400 via-violet-400 to-indigo-400 bg-clip-text text-transparent">
              Your Edits
            </span>
          </h2>

          <p
            ref={subtitleRef}
            className="mt-4 text-sm sm:text-base md:text-lg text-gray-400 text-center max-w-md tracking-wide"
            style={{ opacity: 0 }}
          >
            Two perspectives, one vision — precision meets passion.
          </p>

          <div
            ref={lineRef}
            className="mt-6 h-[1px] bg-gradient-to-r from-transparent via-purple-500/40 to-transparent"
            style={{ width: 0, opacity: 0 }}
          />
        </div>

        {/* Scroll indicator */}
        <div ref={scrollIndicatorRef} className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
          <div className="w-[1px] h-12 bg-gradient-to-b from-purple-500/50 to-transparent opacity-60" />
        </div>

        {/* Vignette */}
        <div
          className="absolute inset-0 pointer-events-none z-[15]"
          style={{
            background: "radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.4) 100%)",
          }}
        />
      </div>
    </section>
  );
}
