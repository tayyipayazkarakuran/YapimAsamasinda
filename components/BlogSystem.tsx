import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { BlogPost } from '../types';

// --- SUPABASE CONFIGURATION ---
// LÜTFEN BURAYI KENDİ SUPABASE PROJE BİLGİLERİNİZLE DOLDURUN
const SUPABASE_URL = 'https://cjztgxndnfjdvzlfhvxt.supabase.co'; 
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqenRneG5kbmZqZHZ6bGZodnh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5NDExMjksImV4cCI6MjA3OTUxNzEyOX0.fBwLYwJIRMmwjrs0fsxDeqt89oqhI_uIq8UrXdL3bDA'; 

// Initialize Client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

interface BlogSystemProps {
  onBack: () => void;
}

// --- SUB-COMPONENTS ---

// Warning component if keys are missing
const ConfigWarning: React.FC = () => (
  <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center p-8">
    <div className="border-2 border-red-500 p-8 max-w-2xl text-center font-mono">
      <h1 className="text-3xl text-red-500 font-bold mb-4 animate-pulse">SİSTEM HATASI: VERİTABANI BAĞLANTISI YOK</h1>
      <p className="text-white mb-6">
        Supabase bağlantı bilgileri eksik. Lütfen <code>components/BlogSystem.tsx</code> dosyasını açın ve
        <code>SUPABASE_URL</code> ile <code>SUPABASE_KEY</code> alanlarını kendi proje bilgilerinizle doldurun.
      </p>
      <div className="bg-gray-900 p-4 rounded text-left text-xs text-green-400 overflow-x-auto">
        <p>// components/BlogSystem.tsx</p>
        <p>const SUPABASE_URL = 'https://xyz.supabase.co';</p>
        <p>const SUPABASE_KEY = 'eyJh...';</p>
      </div>
      <button onClick={() => window.location.reload()} className="mt-8 bg-red-600 text-white px-6 py-2 hover:bg-red-700">
        SAYFAYI YENİLE
      </button>
    </div>
  </div>
);

// 1. Post Editor (Admin)
const Editor: React.FC<{ 
  post?: BlogPost | null; 
  onSave: (post: Omit<BlogPost, 'id'> & { id?: string }) => void; 
  onCancel: () => void; 
  isSaving: boolean;
}> = ({ post, onSave, onCancel, isSaving }) => {
  const [title, setTitle] = useState(post?.title || '');
  const [content, setContent] = useState(post?.content || '');
  const [excerpt, setExcerpt] = useState(post?.excerpt || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: post?.id, // undefined if new
      title,
      content,
      excerpt,
      date: post?.date || new Date().toISOString().split('T')[0],
      author: 'KARAKURAN',
      readTime: Math.ceil(content.split(' ').length / 200) + ' DAK'
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto border-2 border-white bg-black relative shadow-[0_0_30px_rgba(255,255,255,0.1)]">
      {/* Editor Toolbar (Decorative) */}
      <div className="bg-white text-black px-2 py-1 text-xs font-bold flex justify-between items-center font-mono border-b border-white">
        <span>VIM_MODE: INSERT</span>
        <span>UTF-8 // UNIX</span>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 gap-6">
          <div className="group">
            <label className="block text-gray-500 text-xs mb-2 font-mono group-focus-within:text-white transition-colors"> &gt; BAŞLIK_GİRİŞİ</label>
            <input 
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-black border border-gray-700 focus:border-white text-white p-3 font-mono text-lg outline-none transition-all placeholder-gray-700"
              placeholder="BAŞLIK..."
              required
            />
          </div>
          
          <div className="group">
            <label className="block text-gray-500 text-xs mb-2 font-mono group-focus-within:text-white transition-colors"> &gt; ÖZET_METNİ</label>
            <input 
              value={excerpt}
              onChange={e => setExcerpt(e.target.value)}
              className="w-full bg-black border border-gray-700 focus:border-white text-gray-300 p-3 font-mono text-sm outline-none transition-all placeholder-gray-700"
              placeholder="KISA AÇIKLAMA..."
              required
            />
          </div>

          <div className="group relative">
            <label className="block text-gray-500 text-xs mb-2 font-mono group-focus-within:text-white transition-colors"> &gt; İÇERİK_TAMPONU</label>
            <textarea 
              value={content}
              onChange={e => setContent(e.target.value)}
              className="w-full h-[500px] bg-[#050505] border border-gray-700 p-4 font-mono text-sm text-gray-300 focus:text-white focus:border-white outline-none resize-y leading-relaxed"
              placeholder="YAZMAYA BAŞLA..."
              required
            />
            {/* Blinking Cursor Simulation at bottom right */}
            <div className="absolute bottom-4 right-4 w-2 h-4 bg-white animate-pulse pointer-events-none opacity-50"></div>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4 border-t border-gray-800">
          <button type="button" onClick={onCancel} className="text-gray-500 hover:text-white transition-colors text-xs font-mono tracking-widest px-4 py-2 border border-transparent hover:border-gray-600">
            [ İPTAL ET ]
          </button>
          <button 
            type="submit" 
            disabled={isSaving}
            className="bg-white text-black px-8 py-2 font-bold hover:bg-gray-300 transition-colors text-xs font-mono tracking-widest border border-white disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving ? <span className="animate-spin">/</span> : '[ VERİYİ KAYDET ]'}
          </button>
        </div>
      </form>
    </div>
  );
};

// 2. Blog Post View
const BlogPostView: React.FC<{ post: BlogPost; onBack: () => void }> = ({ post, onBack }) => (
  <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
    <button onClick={onBack} className="mb-8 text-xs text-gray-500 hover:text-white transition-colors flex items-center gap-2 font-mono">
      <span>&lt;</span> GERİ DÖN
    </button>
    
    <article className="border-l-2 border-white/20 pl-6 relative">
      <div className="absolute -left-[9px] top-0 w-4 h-4 bg-black border-2 border-white rounded-full"></div>
      
      <header className="mb-8">
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-2 font-mono uppercase">
          <span>{post.date}</span>
          <span>//</span>
          <span>{post.author}</span>
          <span>//</span>
          <span>{post.readTime}</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-bold font-['Syncopate'] leading-tight mb-4 text-white">{post.title}</h1>
        <p className="text-xl text-gray-400 font-light border-b border-gray-800 pb-8 font-mono">{post.excerpt}</p>
      </header>
      
      <div className="prose prose-invert prose-p:font-mono prose-headings:font-['Syncopate'] max-w-none whitespace-pre-wrap text-gray-300 leading-relaxed font-mono">
        {post.content}
      </div>
    </article>
  </div>
);

// 3. Admin Login
const AdminLogin: React.FC<{ onLogin: () => void; onCancel: () => void }> = ({ onLogin, onCancel }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'Karakuran' && password === 'Taytapo123*') {
      onLogin();
    } else {
      setError(true);
      setPassword('');
      setUsername('');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-sm border-2 border-white p-1 bg-black shadow-[0_0_50px_rgba(255,255,255,0.15)]">
        <div className="border border-white/20 p-8 space-y-8">
            <div className="text-center">
                <h2 className="font-['Syncopate'] font-bold text-2xl mb-2 text-white">YÖNETİCİ</h2>
                <div className="h-[1px] w-1/2 mx-auto bg-white/50"></div>
                <p className="text-[10px] text-gray-500 mt-2 font-mono tracking-widest">GÜVENLİ ERİŞİM PROTOKOLÜ</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                <div className="relative group">
                    <label className="text-[10px] text-gray-500 font-mono absolute -top-2 left-2 bg-black px-1 group-focus-within:text-white transition-colors">KULLANICI ADI</label>
                    <input 
                        type="text" 
                        autoFocus
                        value={username}
                        onChange={e => { setUsername(e.target.value); setError(false); }}
                        className="w-full bg-transparent border border-gray-600 focus:border-white outline-none px-4 py-3 text-white font-mono text-sm tracking-wider transition-colors"
                        placeholder="Karakuran"
                    />
                </div>
                <div className="relative group">
                    <label className="text-[10px] text-gray-500 font-mono absolute -top-2 left-2 bg-black px-1 group-focus-within:text-white transition-colors">ŞİFRE</label>
                    <input 
                        type="password" 
                        value={password}
                        onChange={e => { setPassword(e.target.value); setError(false); }}
                        className="w-full bg-transparent border border-gray-600 focus:border-white outline-none px-4 py-3 text-white font-mono text-sm tracking-wider transition-colors"
                        placeholder="••••••••"
                    />
                </div>
            </div>

            {error && (
                <div className="bg-red-900/20 border border-red-500/50 p-2 text-center animate-pulse">
                    <span className="text-red-500 text-xs font-mono font-bold">⚠️ ERİŞİM REDDEDİLDİ ⚠️</span>
                </div>
            )}

            <div className="flex justify-between gap-4 pt-4 border-t border-white/10">
                <button type="button" onClick={onCancel} className="flex-1 text-xs text-gray-500 hover:text-white py-2 font-mono border border-transparent hover:border-gray-800 transition-all">[ İPTAL ]</button>
                <button type="submit" className="flex-1 text-xs bg-white text-black py-2 font-bold hover:bg-gray-300 font-mono border border-white transition-all">[ ONAYLA ]</button>
            </div>
            </form>
        </div>
      </div>
    </div>
  );
};

// --- MAIN BLOG SYSTEM ---

const BlogSystem: React.FC<BlogSystemProps> = ({ onBack }) => {
  const [view, setView] = useState<'list' | 'post' | 'admin'>('list');
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Initial Fetch
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    // Don't try to fetch if config is default
    if (SUPABASE_URL.includes('YOUR_PROJECT_ID')) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('Supabase Error:', error.message);
    } else {
      setPosts(data || []);
    }
    setLoading(false);
  };

  const handleSavePost = async (postData: Omit<BlogPost, 'id'> & { id?: string }) => {
    setIsSaving(true);
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...dataToSave } = postData;

    try {
      if (postData.id) {
        // Update existing
        const { error } = await supabase
          .from('posts')
          .update(dataToSave)
          .eq('id', postData.id);
        
        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase
          .from('posts')
          .insert([dataToSave]);
          
        if (error) throw error;
      }

      await fetchPosts(); // Refresh list
      setIsEditing(false);
      setSelectedPost(null);
    } catch (error: any) {
      alert(`HATA: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePost = async (id: string) => {
    if (window.confirm('Bu veriyi kalıcı olarak veritabanından silmek istediğinize emin misiniz?')) {
      setLoading(true);
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id);

      if (error) {
        alert('Silme işlemi başarısız: ' + error.message);
      } else {
        await fetchPosts();
      }
      setLoading(false);
    }
  };

  // Show warning if user hasn't configured the keys
  if (SUPABASE_URL.includes('YOUR_PROJECT_ID')) {
    return <ConfigWarning />;
  }

  return (
    <div className="relative w-full min-h-screen z-50 pt-24 px-4 pb-12 overflow-y-auto bg-black/50">
      
      {/* Blog Navigation Header */}
      <div className="max-w-5xl mx-auto mb-12 flex justify-between items-end border-b border-white/20 pb-4">
        <div>
           <button onClick={onBack} className="text-xs text-gray-500 hover:text-white mb-2 block font-mono">&lt; ANA EKRAN</button>
           <h2 className="text-4xl font-['Syncopate'] font-bold text-white">VERİ GÜNLÜĞÜ</h2>
        </div>
        
        {!isAdmin ? (
          <button 
            onClick={() => setView('admin')} 
            className="text-[10px] text-gray-600 hover:text-white border border-white/10 hover:border-white px-3 py-1 font-mono transition-all"
          >
            ADMIN GİRİŞİ
          </button>
        ) : (
          <div className="flex gap-4">
            <button onClick={() => setIsAdmin(false)} className="text-xs text-red-500 hover:text-red-400 font-mono tracking-tighter">[ OTURUMU KAPAT ]</button>
            <button 
              onClick={() => { setSelectedPost(null); setIsEditing(true); }} 
              className="bg-white text-black px-4 py-1 text-xs font-bold hover:bg-gray-200 font-mono border border-white"
            >
              + YENİ GİRİŞ
            </button>
          </div>
        )}
      </div>

      {/* ADMIN LOGIN OVERLAY */}
      {view === 'admin' && !isAdmin && (
        <AdminLogin onLogin={() => { setIsAdmin(true); setView('list'); }} onCancel={() => setView('list')} />
      )}

      {/* CONTENT AREA */}
      <div className="max-w-5xl mx-auto">
        
        {loading && !isEditing && view === 'list' && (
          <div className="text-center py-20 font-mono animate-pulse text-green-500">
            &gt; BULUT BAĞLANTISI KURULUYOR...
            <br/>
            &gt; VERİLER İNDİRİLİYOR...
          </div>
        )}

        {!loading && posts.length === 0 && !isEditing && view === 'list' && (
           <div className="text-center py-20 font-mono text-gray-500 border border-white/10 border-dashed">
              [ HİÇBİR VERİ GİRİŞİ BULUNAMADI ]
           </div>
        )}
        
        {isEditing && isAdmin ? (
          <Editor 
            post={selectedPost} 
            onSave={handleSavePost} 
            onCancel={() => { setIsEditing(false); setSelectedPost(null); }} 
            isSaving={isSaving}
          />
        ) : view === 'post' && selectedPost ? (
          <BlogPostView post={selectedPost} onBack={() => { setView('list'); setSelectedPost(null); }} />
        ) : (
          /* POST LIST */
          !loading && view === 'list' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {posts.map(post => (
                <div 
                  key={post.id} 
                  className="group relative border border-white/20 bg-black/40 hover:bg-white/10 transition-all duration-300 p-6 flex flex-col justify-between min-h-[250px] cursor-pointer"
                  onClick={() => { setSelectedPost(post); setView('post'); }}
                >
                  {/* Decorative Corners */}
                  <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white opacity-30 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white opacity-30 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white opacity-30 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white opacity-30 group-hover:opacity-100 transition-opacity" />

                  <div>
                    <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
                      <span className="font-mono text-xs text-green-500 tracking-wider">ENTRY_#{post.id.substring(0,6)}</span>
                      <span className="font-mono text-xs text-gray-500">{post.date}</span>
                    </div>
                    <h3 className="text-2xl font-['Syncopate'] font-bold leading-tight mb-3 group-hover:text-white text-gray-200 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-gray-400 text-sm font-light line-clamp-3 font-mono">
                      {post.excerpt}
                    </p>
                  </div>

                  <div className="flex justify-between items-end mt-6">
                    <span className="text-xs text-gray-600 group-hover:text-white transition-colors font-mono tracking-widest">OKU &gt;&gt;</span>
                    
                    {isAdmin && (
                      <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                        <button 
                          onClick={() => { setSelectedPost(post); setIsEditing(true); }}
                          className="text-xs border border-white/30 text-white hover:bg-white hover:text-black px-2 py-1 transition-colors font-mono"
                        >
                          DÜZENLE
                        </button>
                        <button 
                          onClick={() => handleDeletePost(post.id)}
                          className="text-xs border border-red-900/50 text-red-500 hover:bg-red-600 hover:text-white px-2 py-1 transition-colors font-mono"
                        >
                          SİL
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default BlogSystem;