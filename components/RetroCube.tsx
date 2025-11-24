import React from 'react';

const RetroCube: React.FC = () => {
  return (
    <div className="relative w-48 h-48 sm:w-64 sm:h-64 mx-auto my-12 perspective-container">
      <div className="cube-wrapper">
        <div className="cube">
          <div className="face front">
            <div className="inner-grid" />
          </div>
          <div className="face back">
            <div className="inner-grid" />
          </div>
          <div className="face right">
            <div className="inner-grid" />
          </div>
          <div className="face left">
            <div className="inner-grid" />
          </div>
          <div className="face top">
            <div className="inner-grid" />
          </div>
          <div className="face bottom">
            <div className="inner-grid" />
          </div>
          
          {/* Inner Core */}
          <div className="core"></div>
        </div>
      </div>

      <style>{`
        .cube-wrapper {
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
        }

        .cube {
          width: 100%;
          height: 100%;
          position: relative;
          transform-style: preserve-3d;
          animation: spin 12s infinite linear;
        }

        .face {
          position: absolute;
          width: 100%;
          height: 100%;
          border: 2px solid white;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          backface-visibility: visible;
        }

        .inner-grid {
          width: 80%;
          height: 80%;
          border: 1px dashed rgba(255, 255, 255, 0.3);
          background-image: 
            linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%), 
            linear-gradient(-45deg, rgba(255,255,255,0.1) 25%, transparent 25%);
          background-size: 10px 10px;
        }

        .front  { transform: rotateY(0deg) translateZ(6rem); }
        .back   { transform: rotateY(180deg) translateZ(6rem); }
        .right  { transform: rotateY(90deg) translateZ(6rem); }
        .left   { transform: rotateY(-90deg) translateZ(6rem); }
        .top    { transform: rotateX(90deg) translateZ(6rem); }
        .bottom { transform: rotateX(-90deg) translateZ(6rem); }

        /* Responsive adjustments for translateZ based on size */
        @media (min-width: 640px) {
           .front  { transform: rotateY(0deg) translateZ(8rem); }
           .back   { transform: rotateY(180deg) translateZ(8rem); }
           .right  { transform: rotateY(90deg) translateZ(8rem); }
           .left   { transform: rotateY(-90deg) translateZ(8rem); }
           .top    { transform: rotateX(90deg) translateZ(8rem); }
           .bottom { transform: rotateX(-90deg) translateZ(8rem); }
        }

        .core {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 40%;
            height: 40%;
            background: white;
            transform: translate(-50%, -50%);
            box-shadow: 0 0 20px white;
            animation: pulse 2s infinite ease-in-out;
        }

        @keyframes spin {
          0% { transform: rotateX(0deg) rotateY(0deg); }
          100% { transform: rotateX(360deg) rotateY(360deg); }
        }

        @keyframes pulse {
            0%, 100% { opacity: 0.3; transform: translate(-50%, -50%) scale(0.8); }
            50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>
    </div>
  );
};

export default RetroCube;