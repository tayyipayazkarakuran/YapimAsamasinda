import React from 'react';

const RetroBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black z-10 opacity-80" />
      
      {/* Radial Mask for focus */}
      <div className="absolute inset-0 z-20 bg-[radial-gradient(circle_at_center,transparent_10%,black_90%)]" />

      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, #444 1px, transparent 1px),
            linear-gradient(to bottom, #444 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          transform: 'perspective(500px) rotateX(60deg) scale(2)',
          transformOrigin: 'top center',
          animation: 'gridMove 20s linear infinite'
        }}
      />
      
      {/* Floating Particles/Stars */}
      <div className="absolute inset-0 z-10">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full opacity-30 animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 3 + 2}s`
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes gridMove {
          0% { background-position: 0 0; }
          100% { background-position: 0 40px; }
        }
      `}</style>
    </div>
  );
};

export default RetroBackground;