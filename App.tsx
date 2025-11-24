
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import RetroBackground from './components/RetroBackground';
import RetroCube from './components/RetroCube';
import { BouncingPlanets } from './components/Machinery';
import BlogSystem from './components/BlogSystem';
import { SiteConfig } from './types';

// Supabase Client for App-level SEO fetching
const SUPABASE_URL = 'https://cjztgxndnfjdvzlfhvxt.supabase.co'; 
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqenRneG5kbmZqZHZ6bGZodnh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5NDExMjksImV4cCI6MjA3OTUxNzEyOX0.fBwLYwJIRMmwjrs0fsxDeqt89oqhI_uIq8UrXdL3bDA';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const App: React.FC = () => {
  // View Router: 'home' (public blog) | 'panel' (admin)
  const [currentView, setCurrentView] = useState<'home' | 'panel'>('home');
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
        // Apply ONLY to browser document title (Tab Title)
        if (data.site_title && typeof data.site_title === 'string') {
            document.title = data.site_title;
        }
        
        // Apply ONLY to Meta Description
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

  return (
    <div className="relative h-screen w-full overflow-hidden flex flex-col font-mono text-white selection:bg-white selection:text-black bg-[#050505]">
      <RetroBackground />
      <BouncingPlanets />

      {/* Navigation / Header */}
      <header className="relative z-50 p-4 md:px-8 md:py-6 flex justify-between items-center border-b border-white/10 backdrop-blur-sm bg-black/20 shrink-0 h-16 md:h-20">
        <div className="flex items-center gap-3 md:gap-6">
          <div 
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => setCurrentView('home')}
          >
            <div className="w-3 h-3 md:w-4 md:h-4 bg-white animate-pulse shadow-[0_0_10px_white] group-hover:bg-green-400 transition-colors" />
            <span className="font-bold tracking-widest text-sm md:text-lg text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 group-hover:to-white transition-all whitespace-nowrap">
              KARAKURAN.COM
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden md:block text-[10px] text-gray-500 font-mono">
             SYS_STATUS: ONLINE
          </div>
          
          <button 
            onClick={() => setCurrentView('panel')}
            className={`text-[10px] md:text-xs tracking-widest px-2 py-1 md:px-4 md:py-2 border transition-all font-bold whitespace-nowrap ${currentView === 'panel' ? 'bg-green-500 text-black border-green-500' : 'border-green-900 text-green-500 hover:bg-green-900/20'}`}
          >
            [ PANEL ]
          </button>
        </div>
      </header>

      {/* Main Content Area - Full Height flex grow */}
      <main className="relative z-40 flex-grow w-full overflow-hidden">
        {/* Pass RetroCube as placeholder so it shows up when no post is selected */}
        <BlogSystem 
          mode={currentView === 'panel' ? 'admin' : 'public'} 
          onBack={() => setCurrentView('home')} 
          placeholderComponent={<RetroCube />}
        />
      </main>

      {/* Footer */}
      <footer className="relative z-50 w-full border-t border-white/10 p-4 bg-black/90 text-[10px] uppercase tracking-widest flex justify-between text-gray-500 backdrop-blur-sm shrink-0 h-12 md:h-auto items-center">
        <div className="flex gap-4">
            <span className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full animate-pulse ${currentView === 'panel' ? 'bg-red-500' : 'bg-green-500'}`}></span>
                Sistem: {currentView === 'panel' ? 'YÖNETİCİ MODU' : 'OKUMA MODU'}
            </span>
            <span className="hidden sm:inline">{siteConfig?.footer_text || 'Bölge: TR-ISTANBUL'}</span>
        </div>
        <div className="animate-pulse text-white font-bold hidden md:block">
            /// {currentView === 'panel' ? 'ERİŞİM İZNİ AKTİF' : 'BAĞLANTI KURULDU'} ///
        </div>
      </footer>
    </div>
  );
};

export default App;
