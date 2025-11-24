import React, { useEffect, useRef } from 'react';

// Hook to handle the DVD bouncing logic directly on the DOM element for performance
const useBouncingMovement = (initialX: number, initialY: number, speed: number) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: initialX, y: initialY });
  const vel = useRef({ dx: speed, dy: speed });
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const update = () => {
      if (!elementRef.current) return;

      const el = elementRef.current;
      const rect = el.getBoundingClientRect();
      const parentWidth = window.innerWidth;
      const parentHeight = window.innerHeight;

      // Update positions
      pos.current.x += vel.current.dx;
      pos.current.y += vel.current.dy;

      // Wall collision detection (Right/Left)
      if (pos.current.x + rect.width >= parentWidth) {
        pos.current.x = parentWidth - rect.width;
        vel.current.dx = -Math.abs(vel.current.dx);
      } else if (pos.current.x <= 0) {
        pos.current.x = 0;
        vel.current.dx = Math.abs(vel.current.dx);
      }

      // Wall collision detection (Bottom/Top)
      if (pos.current.y + rect.height >= parentHeight) {
        pos.current.y = parentHeight - rect.height;
        vel.current.dy = -Math.abs(vel.current.dy);
      } else if (pos.current.y <= 0) {
        pos.current.y = 0;
        vel.current.dy = Math.abs(vel.current.dy);
      }

      // Apply transform
      el.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px)`;
      
      frameRef.current = requestAnimationFrame(update);
    };

    frameRef.current = requestAnimationFrame(update);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [speed]);

  return elementRef;
};

const BlueprintGrid = () => (
  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="0.5" opacity="0.2"/>
  </pattern>
);

const PlanetSchematicA: React.FC = () => (
  <svg viewBox="0 0 200 200" className="w-48 h-48 md:w-64 md:h-64 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
    <defs>
      <BlueprintGrid />
    </defs>
    
    {/* Rotating Outer Ring */}
    <g className="origin-center animate-[spin_20s_linear_infinite]">
        <circle cx="100" cy="100" r="90" fill="none" stroke="white" strokeWidth="1" strokeDasharray="10 5" opacity="0.5" />
        <circle cx="100" cy="100" r="85" fill="none" stroke="white" strokeWidth="0.5" opacity="0.3" />
        <path d="M100 10 L100 190 M10 100 L190 100" stroke="white" strokeWidth="0.5" opacity="0.3" />
    </g>

    {/* Main Sphere (Wireframe) */}
    <g className="origin-center">
        <circle cx="100" cy="100" r="60" fill="black" stroke="white" strokeWidth="2" />
        <path d="M40 100 Q100 160 160 100" fill="none" stroke="white" strokeWidth="1" opacity="0.6"/>
        <path d="M40 100 Q100 40 160 100" fill="none" stroke="white" strokeWidth="1" opacity="0.6"/>
        <ellipse cx="100" cy="100" rx="60" ry="20" fill="none" stroke="white" strokeWidth="1" opacity="0.6" />
        <line x1="100" y1="40" x2="100" y2="160" stroke="white" strokeWidth="1" strokeDasharray="4 4" />
    </g>

    {/* Technical Labels */}
    <text x="100" y="190" fill="white" fontSize="8" fontFamily="monospace" textAnchor="middle" opacity="0.8">FIG-A1: CORE SCHEMATIC</text>
    <rect x="130" y="80" width="40" height="1" fill="white" />
    <text x="135" y="75" fill="white" fontSize="8" fontFamily="monospace">SEC-09</text>
  </svg>
);

const PlanetSchematicB: React.FC = () => (
  <svg viewBox="0 0 200 200" className="w-56 h-56 md:w-80 md:h-80 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
     {/* Saturn-like Rings */}
    <g className="origin-center" style={{ transform: 'rotate(-20deg)' }}>
        <ellipse cx="100" cy="100" rx="90" ry="30" fill="none" stroke="white" strokeWidth="1" />
        <ellipse cx="100" cy="100" rx="80" ry="25" fill="none" stroke="white" strokeWidth="0.5" strokeDasharray="5 5" opacity="0.5"/>
    </g>

    {/* Planet Body */}
    <circle cx="100" cy="100" r="45" fill="#000" stroke="white" strokeWidth="2" />
    
    {/* Lat/Long Lines */}
    <path d="M55 100 Q100 130 145 100" fill="none" stroke="white" strokeWidth="0.5" />
    <path d="M55 100 Q100 70 145 100" fill="none" stroke="white" strokeWidth="0.5" />
    <line x1="100" y1="55" x2="100" y2="145" stroke="white" strokeWidth="0.5" />

    {/* Data Points */}
    <circle cx="140" cy="60" r="2" fill="white" className="animate-pulse" />
    <line x1="140" y1="60" x2="180" y2="60" stroke="white" strokeWidth="1" />
    <text x="182" y="62" fill="white" fontSize="8" fontFamily="monospace">ORBIT_ERR</text>

    <text x="20" y="190" fill="white" fontSize="8" fontFamily="monospace" opacity="0.7">PLAN_B // V.0.4</text>
  </svg>
);

export const BouncingPlanets: React.FC = () => {
  // Initialize with somewhat random positions to avoid overlap
  const ref1 = useBouncingMovement(Math.random() * 100, Math.random() * 100, 0.8);
  const ref2 = useBouncingMovement(window.innerWidth - 300, window.innerHeight - 300, 1.2);

  return (
    <>
      <div ref={ref1} className="fixed top-0 left-0 z-0 pointer-events-none opacity-40 mix-blend-screen will-change-transform">
        <PlanetSchematicA />
      </div>
      <div ref={ref2} className="fixed top-0 left-0 z-0 pointer-events-none opacity-40 mix-blend-screen will-change-transform">
        <PlanetSchematicB />
      </div>
    </>
  );
};