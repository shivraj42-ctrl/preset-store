"use client";

import { useRef, useEffect, useState, useCallback, type ReactNode } from "react";
import { gsap } from "gsap";

/* ── Constants ── */
const DEFAULT_GLOW_COLOR = "132, 0, 255";
const DEFAULT_SPOTLIGHT_RADIUS = 400;
const DEFAULT_PARTICLE_COUNT = 12;

/* ── Helpers ── */
const createParticleElement = (x: number, y: number, color: string) => {
  const el = document.createElement("div");
  el.className = "bento-particle";
  el.style.cssText = `
    position:absolute;width:4px;height:4px;border-radius:50%;
    background:rgba(${color},1);box-shadow:0 0 6px rgba(${color},0.6);
    pointer-events:none;z-index:100;left:${x}px;top:${y}px;
  `;
  return el;
};

/* ── ParticleCard ── */
function ParticleCard({
  children, className = "", style, glowColor = DEFAULT_GLOW_COLOR,
  particleCount = DEFAULT_PARTICLE_COUNT, clickEffect = false, disableAnimations = false,
}: {
  children: ReactNode; className?: string; style?: React.CSSProperties;
  glowColor?: string; particleCount?: number; clickEffect?: boolean; disableAnimations?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const particles = useRef<HTMLDivElement[]>([]);
  const timeouts = useRef<number[]>([]);
  const isHovered = useRef(false);
  const memoized = useRef<HTMLDivElement[]>([]);
  const inited = useRef(false);

  const initParticles = useCallback(() => {
    if (inited.current || !ref.current) return;
    const { width, height } = ref.current.getBoundingClientRect();
    memoized.current = Array.from({ length: particleCount }, () =>
      createParticleElement(Math.random() * width, Math.random() * height, glowColor)
    );
    inited.current = true;
  }, [particleCount, glowColor]);

  const clearAll = useCallback(() => {
    timeouts.current.forEach(clearTimeout);
    timeouts.current = [];
    particles.current.forEach(p => {
      gsap.to(p, { scale: 0, opacity: 0, duration: 0.3, ease: "back.in(1.7)", onComplete: () => { p.parentNode?.removeChild(p); } });
    });
    particles.current = [];
  }, []);

  const animate = useCallback(() => {
    if (!ref.current || !isHovered.current) return;
    if (!inited.current) initParticles();
    memoized.current.forEach((p, i) => {
      const id = window.setTimeout(() => {
        if (!isHovered.current || !ref.current) return;
        const clone = p.cloneNode(true) as HTMLDivElement;
        ref.current!.appendChild(clone);
        particles.current.push(clone);
        gsap.fromTo(clone, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(1.7)" });
        gsap.to(clone, { x: (Math.random() - 0.5) * 100, y: (Math.random() - 0.5) * 100, rotation: Math.random() * 360, duration: 2 + Math.random() * 2, ease: "none", repeat: -1, yoyo: true });
        gsap.to(clone, { opacity: 0.3, duration: 1.5, ease: "power2.inOut", repeat: -1, yoyo: true });
      }, i * 100);
      timeouts.current.push(id);
    });
  }, [initParticles]);

  useEffect(() => {
    if (disableAnimations || !ref.current) return;
    const el = ref.current;
    const enter = () => { isHovered.current = true; animate(); };
    const leave = () => { isHovered.current = false; clearAll(); };
    const click = (e: MouseEvent) => {
      if (!clickEffect) return;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left, y = e.clientY - rect.top;
      const max = Math.max(Math.hypot(x, y), Math.hypot(x - rect.width, y), Math.hypot(x, y - rect.height), Math.hypot(x - rect.width, y - rect.height));
      const ripple = document.createElement("div");
      ripple.style.cssText = `position:absolute;width:${max * 2}px;height:${max * 2}px;border-radius:50%;background:radial-gradient(circle,rgba(${glowColor},0.4) 0%,rgba(${glowColor},0.2) 30%,transparent 70%);left:${x - max}px;top:${y - max}px;pointer-events:none;z-index:1000;`;
      el.appendChild(ripple);
      gsap.fromTo(ripple, { scale: 0, opacity: 1 }, { scale: 1, opacity: 0, duration: 0.8, ease: "power2.out", onComplete: () => ripple.remove() });
    };
    el.addEventListener("mouseenter", enter);
    el.addEventListener("mouseleave", leave);
    el.addEventListener("click", click);
    return () => { isHovered.current = false; el.removeEventListener("mouseenter", enter); el.removeEventListener("mouseleave", leave); el.removeEventListener("click", click); clearAll(); };
  }, [animate, clearAll, disableAnimations, clickEffect, glowColor]);

  return <div ref={ref} className={`${className} relative overflow-hidden`} style={{ ...style, position: "relative", overflow: "hidden" }}>{children}</div>;
}

/* ── GlobalSpotlight ── */
function GlobalSpotlight({ gridRef, spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS, glowColor = DEFAULT_GLOW_COLOR }: { gridRef: React.RefObject<HTMLDivElement | null>; spotlightRadius?: number; glowColor?: string }) {
  const spotRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!gridRef?.current) return;
    const spot = document.createElement("div");
    spot.style.cssText = `position:fixed;width:800px;height:800px;border-radius:50%;pointer-events:none;background:radial-gradient(circle,rgba(${glowColor},0.15) 0%,rgba(${glowColor},0.08) 15%,rgba(${glowColor},0.04) 25%,rgba(${glowColor},0.02) 40%,transparent 70%);z-index:200;opacity:0;transform:translate(-50%,-50%);mix-blend-mode:screen;`;
    document.body.appendChild(spot);
    spotRef.current = spot;

    const proximity = spotlightRadius * 0.5;
    const fade = spotlightRadius * 0.75;

    const move = (e: MouseEvent) => {
      if (!spotRef.current || !gridRef.current) return;
      const section = gridRef.current;
      const rect = section.getBoundingClientRect();
      const inside = e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
      const cards = section.querySelectorAll(".bento-card");

      if (!inside) {
        gsap.to(spotRef.current, { opacity: 0, duration: 0.3 });
        cards.forEach(c => (c as HTMLElement).style.setProperty("--glow-intensity", "0"));
        return;
      }

      let minDist = Infinity;
      cards.forEach(c => {
        const cr = c.getBoundingClientRect();
        const cx = cr.left + cr.width / 2, cy = cr.top + cr.height / 2;
        const dist = Math.max(0, Math.hypot(e.clientX - cx, e.clientY - cy) - Math.max(cr.width, cr.height) / 2);
        minDist = Math.min(minDist, dist);
        let glow = 0;
        if (dist <= proximity) glow = 1;
        else if (dist <= fade) glow = (fade - dist) / (fade - proximity);
        const el = c as HTMLElement;
        el.style.setProperty("--glow-x", `${((e.clientX - cr.left) / cr.width) * 100}%`);
        el.style.setProperty("--glow-y", `${((e.clientY - cr.top) / cr.height) * 100}%`);
        el.style.setProperty("--glow-intensity", glow.toString());
        el.style.setProperty("--glow-radius", `${spotlightRadius}px`);
      });

      gsap.to(spotRef.current, { left: e.clientX, top: e.clientY, duration: 0.1 });
      const opTarget = minDist <= proximity ? 0.8 : minDist <= fade ? ((fade - minDist) / (fade - proximity)) * 0.8 : 0;
      gsap.to(spotRef.current, { opacity: opTarget, duration: opTarget > 0 ? 0.2 : 0.5 });
    };

    const leave = () => {
      gridRef.current?.querySelectorAll(".bento-card").forEach(c => (c as HTMLElement).style.setProperty("--glow-intensity", "0"));
      if (spotRef.current) gsap.to(spotRef.current, { opacity: 0, duration: 0.3 });
    };

    document.addEventListener("mousemove", move);
    document.addEventListener("mouseleave", leave);
    return () => {
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseleave", leave);
      spotRef.current?.parentNode?.removeChild(spotRef.current);
    };
  }, [gridRef, spotlightRadius, glowColor]);

  return null;
}

/* ── BentoCard ── */
export function BentoCard({
  children, className = "", label, enableBorderGlow = true, enableStars = true,
  glowColor = DEFAULT_GLOW_COLOR, particleCount = DEFAULT_PARTICLE_COUNT, clickEffect = true,
}: {
  children: ReactNode; className?: string; label?: string; enableBorderGlow?: boolean;
  enableStars?: boolean; glowColor?: string; particleCount?: number; clickEffect?: boolean;
}) {
  const baseClass = `bento-card flex flex-col justify-between relative w-full p-5 rounded-[20px] border border-white/10 font-light overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(0,0,0,0.15)] ${enableBorderGlow ? "bento-card--glow" : ""} ${className}`;
  const style: any = {
    backgroundColor: "rgba(6,0,16,0.6)",
    backdropFilter: "blur(12px)",
    color: "white",
    "--glow-x": "50%", "--glow-y": "50%", "--glow-intensity": "0", "--glow-radius": "200px",
  };

  if (enableStars) {
    return (
      <ParticleCard className={baseClass} style={style} glowColor={glowColor} particleCount={particleCount} clickEffect={clickEffect}>
        {label && <div className="flex justify-between gap-3 text-white mb-3"><span className="text-xs uppercase tracking-[2px] text-purple-400 font-medium">{label}</span></div>}
        <div className="relative z-10 flex-1">{children}</div>
      </ParticleCard>
    );
  }

  return (
    <div className={baseClass} style={style}>
      {label && <div className="flex justify-between gap-3 text-white mb-3"><span className="text-xs uppercase tracking-[2px] text-purple-400 font-medium">{label}</span></div>}
      <div className="relative z-10 flex-1">{children}</div>
    </div>
  );
}

/* ── BentoGrid ── */
export default function BentoGrid({
  children, className = "", enableSpotlight = true,
  spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS, glowColor = DEFAULT_GLOW_COLOR,
}: {
  children: ReactNode; className?: string; enableSpotlight?: boolean;
  spotlightRadius?: number; glowColor?: string;
}) {
  const gridRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <style>{`
        .bento-card--glow::after {
          content:'';position:absolute;inset:0;padding:6px;
          background:radial-gradient(var(--glow-radius) circle at var(--glow-x) var(--glow-y),
            rgba(${glowColor},calc(var(--glow-intensity)*0.8)) 0%,
            rgba(${glowColor},calc(var(--glow-intensity)*0.4)) 30%,
            transparent 60%);
          border-radius:inherit;
          -webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);
          -webkit-mask-composite:xor;mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);
          mask-composite:exclude;pointer-events:none;z-index:1;
        }
        .bento-card--glow:hover {box-shadow:0 4px 20px rgba(46,24,78,0.4),0 0 30px rgba(${glowColor},0.2);}
        .bento-particle::before {content:'';position:absolute;inset:-2px;background:rgba(${glowColor},0.2);border-radius:50%;z-index:-1;}
      `}</style>

      {enableSpotlight && <GlobalSpotlight gridRef={gridRef} spotlightRadius={spotlightRadius} glowColor={glowColor} />}

      <div ref={gridRef} className={`grid gap-4 ${className}`}>
        {children}
      </div>
    </>
  );
}
