import React, { useState, useEffect } from 'react';
import RetroBackground from './components/RetroBackground';
import RetroCube from './components/RetroCube';
import { BouncingPlanets } from './components/Machinery';

const TypingEffect: React.FC<{ text: string; speed?: number }> = ({ text, speed = 100 }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [cursorVisible, setCursorVisible] = useState(true);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length - 1) { // -1 because index is 0 based
        setDisplayedText((prev) => prev + text[index]);
        index++;
      } else {
        clearInterval(interval);
      }
    }, speed);

    const cursorInterval = setInterval(() => {
      setCursorVisible((prev) => !prev);
    }, 500);

    return () => {
      clearInterval(interval);
      clearInterval(cursorInterval);
    };
  }, [text, speed]);

  return (
    <div className="font-mono text-lg md:text-xl text-green-400 bg-black/80 p-4 border border-green-900 shadow-[0_0_10px_rgba(0,255,0,0.2)] inline-block min-w-[300px] text-left">
      <div className="mb-2 text-xs text-gray-500 border-b border-gray-800 pb-1">C:\SYSTEM\BOOT.EXE</div>
      <span>{">"} {displayedText}</span>
      <span className={`${cursorVisible ? 'opacity-100' : 'opacity-0'} ml-1`}>_</span>
    </div>
  );
};

const App: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setMessage('Teşekkürler! Haber vereceğiz.');
      setEmail('');
    }, 1500);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex flex-col font-mono text-white selection:bg-white selection:text-black">
      <RetroBackground />
      
      {/* Moving Background Elements */}
      <BouncingPlanets />

      {/* Navigation / Header */}
      <header className="relative z-50 p-6 flex justify-between items-center border-b border-white/10 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-white animate-pulse shadow-[0_0_10px_white]" />
          <span className="font-bold tracking-widest text-lg text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">KARAKURAN.COM</span>
        </div>
        <div className="text-xs md:text-sm text-gray-400">
          V.1.0_BETA
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-40 flex-grow flex flex-col items-center justify-center p-4 w-full">
        
        {/* Central Content */}
        <div className="max-w-4xl w-full text-center space-y-12 relative z-10">
          
          {/* Glitch Title */}
          <div className="relative inline-block mb-4">
            <h1 className="text-4xl md:text-6xl lg:text-8xl font-black font-['Syncopate'] tracking-tighter text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
              YAPIM<br />AŞAMASINDA
            </h1>
            <div className="absolute top-0 left-0 w-full h-full text-gray-400 opacity-30 animate-pulse -z-10 blur-[2px] translate-x-1">
               YAPIM<br />AŞAMASINDA
            </div>
            <div className="absolute top-0 left-0 w-full h-full text-white opacity-20 animate-pulse -z-10 blur-[2px] -translate-x-1">
               YAPIM<br />AŞAMASINDA
            </div>
          </div>

          {/* DOS Typing Effect */}
          <div>
            <TypingEffect text="SİSTEM YÜKLENİYOR... %85" />
          </div>

          {/* 3D Element */}
          <RetroCube />

          {/* Newsletter Section */}
          <div className="max-w-md mx-auto w-full backdrop-blur-md bg-black/60 border border-white/20 p-2 mt-8 rounded-sm shadow-2xl">
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
              <input 
                type="email" 
                placeholder="E-POSTA ADRESİNİZ" 
                className="flex-grow bg-white/5 border border-white/10 outline-none px-4 py-3 text-white placeholder-gray-500 focus:bg-white/10 focus:border-white transition-all font-mono text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button 
                type="submit" 
                disabled={loading}
                className="bg-white text-black px-6 py-3 font-bold hover:bg-gray-200 hover:scale-105 transition-all uppercase text-sm tracking-wider disabled:opacity-50 flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.2)]"
              >
                {loading ? (
                    <span className="inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                ) : (
                    "HABER VER"
                )}
              </button>
            </form>
          </div>
          
          {message && (
             <div className="text-xs text-green-400 mt-2 animate-bounce font-bold tracking-widest">
                > {message}
             </div>
          )}

        </div>
      </main>

      {/* Footer / Status Bar */}
      <footer className="relative z-50 w-full border-t border-white/10 p-4 bg-black/90 text-[10px] uppercase tracking-widest flex justify-between text-gray-500 backdrop-blur-sm">
        <div className="flex gap-4">
            <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Sistem: ONLINE
            </span>
            <span>Bölge: TR-ISTANBUL</span>
        </div>
        <div className="animate-pulse text-white font-bold">
            /// BEKLEMEDE ///
        </div>
      </footer>
    </div>
  );
};

export default App;