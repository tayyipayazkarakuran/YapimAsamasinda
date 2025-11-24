
import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import RetroBackground from './components/RetroBackground';
import RetroCube from './components/RetroCube';
import { BouncingPlanets } from './components/Machinery';
import BlogSystem from './components/BlogSystem';
import { SiteConfig } from './types';

// Supabase Client for App-level SEO fetching
// Note: This matches the config in BlogSystem.tsx. Ideally, this should be in a shared config file.
const SUPABASE_URL = 'https://cjztgxndnfjdvzlfhvxt.supabase.co'; 
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqenRneG5kbmZqZHZ6bGZodnh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5NDExMjksImV4cCI6MjA3OTUxNzEyOX0.fBwLYwJIRMmwjrs0fsxDeqt89oqhI_uIq8UrXdL3bDA';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const TypingEffect: React.FC<{ text: string; speed?: number }> = ({ text, speed = 100 }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [cursorVisible, setCursorVisible] = useState(true);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length - 1) { 
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
  const emailInputRef = useRef<HTMLInputElement>(null);
  
  // View Router: 'home' | 'blog' | 'panel'
  const [currentView, setCurrentView] = useState<'home' | 'blog' | 'panel'>('home');
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null);

  // Fetch SEO Settings on Mount
  useEffect(() => {
    const fetchSettings = async () => {
      if (SUPABASE_URL.includes('YOUR_PROJECT_ID')) return;
      
      const { data } = await supabase
        .from('site_settings')
        .select('*')
        .single();
      
      if (data) {
        setSiteConfig(data);
        // Apply to document
        document.title = data.site_title || 'YAPIM AŞAMASINDA';
        
        // Update Meta Description
        let metaDesc = document.querySelector('meta[name="description"]');
        if (!metaDesc) {
          metaDesc = document.createElement('meta');
          metaDesc.setAttribute('name', 'description');
          document.head.appendChild(metaDesc);
        }
        metaDesc.setAttribute('content', data.site_description || '');
      }
    };

    fetchSettings();
  }, [currentView]); // Re-fetch when view changes to keep sync

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setMessage('Teşekkürler! Haber vereceğiz.');
      setEmail('');
    }, 1500);
  };

  const clearEmail = () => {
    setEmail('');
    emailInputRef.current?.focus();
  };

  // Helper to safely get title string
  const getSafeTitle = () => {
    if (siteConfig && typeof siteConfig.site_title === 'string' && siteConfig.site_title.length > 0) {
      return siteConfig.site_title;
    }
    return "YAPIM AŞAMASINDA";
  };
  
  const displayTitle = getSafeTitle();

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex flex-col font-mono text-white selection:bg-white selection:text-black">
      <RetroBackground />
      <BouncingPlanets />

      {/* Navigation / Header */}
      <header className="relative z-50 p-6 flex justify-between items-center border-b border-white/10 backdrop-blur-sm">
        <div className="flex items-center gap-6">
          <div 
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => setCurrentView('home')}
          >
            <div className="w-4 h-4 bg-white animate-pulse shadow-[0_0_10px_white] group-hover:bg-green-400 transition-colors" />
            <span className="font-bold tracking-widest text-lg text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 group-hover:to-white transition-all">
              KARAKURAN.COM
            </span>
          </div>
          
          <button 
            onClick={() => setCurrentView('blog')}
            className={`text-xs tracking-widest px-3 py-1 border transition-all flex items-center gap-2 ${currentView === 'blog' ? 'bg-white text-black border-white' : 'border-white/20 hover:border-white text-gray-400 hover:text-white'}`}
          >
             <span>//</span> BLOG
          </button>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:block text-[10px] text-gray-500 font-mono">
            {siteConfig?.site_title ? `SYS_CFG: ${siteConfig.site_title.substring(0, 15)}...` : 'SYS_DEFAULT'}
          </div>
          
          <button 
            onClick={() => setCurrentView('panel')}
            className={`text-xs tracking-widest px-4 py-2 border transition-all font-bold ${currentView === 'panel' ? 'bg-green-500 text-black border-green-500' : 'border-green-900 text-green-500 hover:bg-green-900/20'}`}
          >
            [ PANEL ]
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-40 flex-grow flex flex-col items-center justify-center p-4 w-full">
        
        {currentView === 'home' ? (
          /* LANDING PAGE CONTENT */
          <div className="max-w-4xl w-full text-center space-y-12 relative z-10 animate-in fade-in zoom-in duration-500">
            
            {/* Glitch Title */}
            <div className="relative inline-block mb-4 group select-none">
              <h1 className="relative z-10 text-4xl md:text-6xl lg:text-8xl font-black font-['Syncopate'] tracking-tighter text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                {displayTitle.split(' ').map((word, i) => (
                  <span key={i} className="block md:inline-block mr-4">{word}</span>
                ))}
              </h1>
              
              <h1 className="glitch-layer absolute top-0 left-0 w-full h-full text-red-500 opacity-70 z-0 pointer-events-none" aria-hidden="true">
                 {displayTitle.split(' ').map((word, i) => (
                  <span key={i} className="block md:inline-block mr-4">{word}</span>
                ))}
              </h1>
              <h1 className="glitch-layer-2 absolute top-0 left-0 w-full h-full text-cyan-400 opacity-70 z-0 pointer-events-none" aria-hidden="true">
                 {displayTitle.split(' ').map((word, i) => (
                  <span key={i} className="block md:inline-block mr-4">{word}</span>
                ))}
              </h1>

              <style>{`
                @keyframes glitch-anim-1 {
                  0% { clip-path: inset(20% 0 80% 0); transform: translate(-2px, 1px); }
                  20% { clip-path: inset(60% 0 10% 0); transform: translate(2px, -1px); }
                  40% { clip-path: inset(40% 0 50% 0); transform: translate(-2px, 2px); }
                  60% { clip-path: inset(80% 0 5% 0); transform: translate(2px, -2px); }
                  80% { clip-path: inset(10% 0 70% 0); transform: translate(-1px, 1px); }
                  100% { clip-path: inset(30% 0 50% 0); transform: translate(1px, -1px); }
                }
                .glitch-layer { animation: glitch-anim-1 2.5s infinite linear alternate-reverse; }
                .glitch-layer-2 { animation: glitch-anim-1 2s infinite linear alternate-reverse; animation-delay: 0.5s; }
              `}</style>
            </div>

            {/* DOS Typing Effect */}
            <div>
              <TypingEffect text={siteConfig?.site_description || "SİSTEM YÜKLENİYOR... %85"} />
            </div>

            {/* 3D Element */}
            <RetroCube />

            {/* Newsletter Section */}
            <div className="max-w-md mx-auto w-full backdrop-blur-md bg-black/60 border border-white/20 p-2 mt-8 rounded-sm shadow-2xl relative">
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 relative z-20">
                <div className="relative flex-grow group/input">
                  <input 
                    ref={emailInputRef}
                    type="email" 
                    placeholder="E-POSTA ADRESİNİZ" 
                    className="w-full bg-white/5 border border-white/10 outline-none px-4 py-3 text-white placeholder-gray-500 transition-all font-mono text-sm focus:bg-white/10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <div className="absolute bottom-0 left-0 h-[1px] bg-green-500 w-0 transition-all duration-300 group-focus-within/input:w-full"></div>
                  
                  {email && (
                    <button 
                      type="button" 
                      onClick={clearEmail}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-white font-bold p-1"
                    >
                      [X]
                    </button>
                  )}
                </div>

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
                  &gt; {message}
               </div>
            )}

          </div>
        ) : (
          /* BLOG SYSTEM (Public or Admin Mode) */
          <div className="w-full h-full">
            <BlogSystem 
              mode={currentView === 'panel' ? 'admin' : 'public'} 
              onBack={() => setCurrentView('home')} 
            />
          </div>
        )}
      </main>

      <footer className="relative z-50 w-full border-t border-white/10 p-4 bg-black/90 text-[10px] uppercase tracking-widest flex justify-between text-gray-500 backdrop-blur-sm">
        <div className="flex gap-4">
            <span className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full animate-pulse ${currentView === 'panel' ? 'bg-red-500' : 'bg-green-500'}`}></span>
                Sistem: {currentView === 'home' ? 'ONLINE' : currentView === 'panel' ? 'YÖNETİCİ MODU' : 'OKUMA MODU'}
            </span>
            <span>{siteConfig?.footer_text || 'Bölge: TR-ISTANBUL'}</span>
        </div>
        <div className="animate-pulse text-white font-bold">
            /// {currentView === 'home' ? 'BEKLEMEDE' : 'AKTARIM SÜRÜYOR'} ///
        </div>
      </footer>
    </div>
  );
};

export default App;
