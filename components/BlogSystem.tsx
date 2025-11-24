
import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { marked } from 'marked';
import { BlogPost, SiteConfig } from '../types';

// --- SUPABASE CONFIGURATION ---
const SUPABASE_URL = 'https://cjztgxndnfjdvzlfhvxt.supabase.co'; 
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqenRneG5kbmZqZHZ6bGZodnh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5NDExMjksImV4cCI6MjA3OTUxNzEyOX0.fBwLYwJIRMmwjrs0fsxDeqt89oqhI_uIq8UrXdL3bDA'; 

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

interface BlogSystemProps {
  onBack: () => void;
  mode: 'public' | 'admin';
}

marked.use({ breaks: true, gfm: true });

// --- SUB-COMPONENTS ---

const RetroLoader: React.FC = () => {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setProgress(prev => (prev >= 100 ? 0 : prev + 5)), 100);
    return () => clearInterval(timer);
  }, []);
  const bars = Math.floor(progress / 5);
  return (
    <div className="flex flex-col items-center justify-center py-20 font-mono space-y-4">
      <div className="text-green-500 animate-pulse text-xl font-bold">&gt; VERİLER İNDİRİLİYOR...</div>
      <div className="text-white text-lg">[{'|'.repeat(bars)}{'.'.repeat(20 - bars)}] {progress}%</div>
      <div className="text-xs text-gray-500">BAĞLANTI: ŞİFRELENMİŞ // TLS 1.3</div>
    </div>
  );
};

const ConfigWarning: React.FC = () => (
  <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center p-8">
    <div className="border-2 border-red-500 p-8 max-w-2xl text-center font-mono">
      <h1 className="text-3xl text-red-500 font-bold mb-4 animate-pulse">SİSTEM HATASI</h1>
      <p className="text-white mb-6">Veritabanı bağlantı bilgileri eksik.</p>
    </div>
  </div>
);

// 1. Settings Editor (System Config)
const SettingsEditor: React.FC = () => {
  const [config, setConfig] = useState<SiteConfig>({
    site_title: '',
    site_description: '',
    meta_keywords: '',
    robots_txt: '',
    footer_text: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('site_settings').select('*').single();
    if (!error && data) setConfig(data);
    else if (error && error.code !== 'PGRST116') console.error(error); // PGRST116 is no rows found
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    // Check if exists first to update or insert
    const { data: existing } = await supabase.from('site_settings').select('id').single();
    
    let error;
    if (existing) {
       const { error: err } = await supabase.from('site_settings').update(config).eq('id', existing.id);
       error = err;
    } else {
       const { error: err } = await supabase.from('site_settings').insert([config]);
       error = err;
    }

    if (error) alert('Kayıt Başarısız: ' + error.message);
    else alert('Ayarlar Güncellendi! Sayfayı yenileyince aktif olur.');
    
    setSaving(false);
  };

  if (loading) return <RetroLoader />;

  return (
    <div className="max-w-2xl mx-auto border border-white/20 p-8 bg-black/50">
       <h3 className="font-['Syncopate'] text-2xl mb-6 border-b border-white/20 pb-4">SİSTEM YAPILANDIRMASI</h3>
       <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-xs font-mono text-green-400">SITE_TITLE (Browser Title & H1)</label>
            <input 
              value={config.site_title}
              onChange={e => setConfig({...config, site_title: e.target.value})}
              className="w-full bg-black border border-gray-700 p-3 text-white font-mono focus:border-green-500 outline-none"
              placeholder="Örn: KARAKURAN.COM | YAPIM AŞAMASINDA"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-mono text-green-400">META_DESCRIPTION (SEO)</label>
            <textarea 
              value={config.site_description}
              onChange={e => setConfig({...config, site_description: e.target.value})}
              className="w-full bg-black border border-gray-700 p-3 text-white font-mono focus:border-green-500 outline-none h-24"
              placeholder="Site açıklaması..."
            />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-mono text-green-400">META_KEYWORDS (Virgül ile ayır)</label>
            <input 
              value={config.meta_keywords}
              onChange={e => setConfig({...config, meta_keywords: e.target.value})}
              className="w-full bg-black border border-gray-700 p-3 text-white font-mono focus:border-green-500 outline-none"
              placeholder="mimari, teknoloji, retro..."
            />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-mono text-green-400">ROBOTS.TXT CONFIG</label>
            <textarea 
              value={config.robots_txt}
              onChange={e => setConfig({...config, robots_txt: e.target.value})}
              className="w-full bg-black border border-gray-700 p-3 text-gray-400 font-mono focus:border-green-500 outline-none h-32 text-xs"
              placeholder="User-agent: *&#10;Allow: /"
            />
          </div>
          <div className="pt-4">
             <button type="submit" disabled={saving} className="bg-green-600 text-black px-6 py-3 font-bold hover:bg-green-500 w-full font-mono uppercase">
               {saving ? 'KAYDEDİLİYOR...' : '[ AYARLARI KAYDET ]'}
             </button>
          </div>
       </form>
    </div>
  );
}

// 2. Post Editor (Admin)
const Editor: React.FC<{ 
  post?: BlogPost | null; 
  onSave: (post: Omit<BlogPost, 'id'> & { id?: string }) => void; 
  onCancel: () => void; 
  isSaving: boolean;
}> = ({ post, onSave, onCancel, isSaving }) => {
  const [title, setTitle] = useState(post?.title || '');
  const [content, setContent] = useState(post?.content || '');
  const [excerpt, setExcerpt] = useState(post?.excerpt || '');
  const [tagsInput, setTagsInput] = useState(post?.tags ? post.tags.join(', ') : '');
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tags = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    onSave({
      id: post?.id,
      title,
      content,
      excerpt,
      date: post?.date || new Date().toISOString().split('T')[0],
      author: 'KARAKURAN',
      readTime: Math.ceil(content.split(' ').length / 200) + ' DAK',
      tags: tags
    });
  };

  const insertTextAtCursor = (textToInsert: string, cursorOffset = 0) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const newText = text.substring(0, start) + textToInsert + text.substring(end);
    setContent(newText);
    setTimeout(() => { textarea.focus(); textarea.setSelectionRange(start + cursorOffset, start + cursorOffset); }, 0);
  };

  const wrapSelection = (startTag: string, endTag: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const newText = text.substring(0, start) + startTag + text.substring(start, end) + endTag + text.substring(end);
    setContent(newText);
    setTimeout(() => { textarea.focus(); textarea.setSelectionRange(end + startTag.length + endTag.length, end + startTag.length + endTag.length); }, 0);
  };

  return (
    <div className="w-full max-w-4xl mx-auto border border-white bg-black">
      <div className="flex border-b border-gray-800 bg-gray-900">
        <button type="button" onClick={() => setActiveTab('write')} className={`px-6 py-2 text-xs font-mono font-bold ${activeTab === 'write' ? 'bg-black text-green-400' : 'text-gray-500'}`}>[ EDİTÖR ]</button>
        <button type="button" onClick={() => setActiveTab('preview')} className={`px-6 py-2 text-xs font-mono font-bold ${activeTab === 'preview' ? 'bg-black text-white' : 'text-gray-500'}`}>[ ÖNİZLEME ]</button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 gap-4">
            <input value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-black border border-gray-700 text-white p-3 font-mono text-lg outline-none" placeholder="BAŞLIK..." required />
            <input value={excerpt} onChange={e => setExcerpt(e.target.value)} className="w-full bg-black border border-gray-700 text-gray-300 p-3 font-mono text-sm outline-none" placeholder="ÖZET..." required />
            <input value={tagsInput} onChange={e => setTagsInput(e.target.value)} className="w-full bg-black border border-gray-700 text-green-400 p-3 font-mono text-sm outline-none" placeholder="etiket1, etiket2..." />
        </div>

        {activeTab === 'write' ? (
            <div className="group relative">
              <div className="flex flex-wrap gap-1 mb-2 bg-gray-900 p-2 border border-gray-700">
                 <button type="button" onClick={() => wrapSelection('**', '**')} className="bg-black text-white border border-gray-600 px-2 text-xs">B</button>
                 <button type="button" onClick={() => wrapSelection('*', '*')} className="bg-black text-white border border-gray-600 px-2 text-xs">I</button>
                 <button type="button" onClick={() => insertTextAtCursor('## ', 3)} className="bg-black text-white border border-gray-600 px-2 text-xs">H2</button>
                 <button type="button" onClick={() => insertTextAtCursor('\n- ', 3)} className="bg-black text-white border border-gray-600 px-2 text-xs">LIST</button>
                 <button type="button" onClick={() => {const u = prompt('URL:'); if(u) insertTextAtCursor(`![Img](${u})`)}} className="bg-black text-green-400 border border-green-900 px-2 text-xs">IMG</button>
              </div>
              <textarea ref={textareaRef} value={content} onChange={e => setContent(e.target.value)} className="w-full h-[400px] bg-[#050505] border border-gray-700 p-4 font-mono text-sm text-gray-300 outline-none" placeholder="İçerik..." required />
            </div>
        ) : (
            <div className="w-full h-[450px] bg-[#050505] border border-gray-700 p-8 overflow-y-auto prose prose-invert prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: marked.parse(content || '') as string }} />
        )}

        <div className="flex justify-end gap-4">
          <button type="button" onClick={onCancel} className="text-gray-500 hover:text-white px-4 py-2 font-mono text-xs">[ İPTAL ]</button>
          <button type="submit" disabled={isSaving} className="bg-white text-black px-6 py-2 font-bold hover:bg-gray-300 font-mono text-xs">{isSaving ? '...' : '[ KAYDET ]'}</button>
        </div>
      </form>
    </div>
  );
};

// 3. Post Viewer
const BlogPostView: React.FC<{ post: BlogPost; onBack: () => void }> = ({ post, onBack }) => (
  <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
    <button onClick={onBack} className="mb-8 text-xs text-gray-500 hover:text-white transition-colors font-mono">&lt; LİSTEYE DÖN</button>
    <article className="border-l-2 border-white/20 pl-6 relative">
      <header className="mb-10">
        <div className="text-xs text-green-500 mb-3 font-mono uppercase">{post.date} // {post.author} // {post.readTime}</div>
        <h1 className="text-3xl md:text-5xl font-bold font-['Syncopate'] leading-none mb-6 text-white uppercase">{post.title}</h1>
        {post.tags && (
          <div className="flex flex-wrap gap-2 mb-6">
            {post.tags.map((tag, i) => <span key={i} className="text-[10px] border border-white/20 px-2 py-1 text-gray-400 font-mono">#{tag}</span>)}
          </div>
        )}
        <p className="text-lg text-gray-400 italic border-b border-gray-800 pb-8 font-mono">{post.excerpt}</p>
      </header>
      <div className="prose prose-invert prose-lg max-w-none font-mono text-gray-300" dangerouslySetInnerHTML={{ __html: marked.parse(post.content) as string }} />
    </article>
  </div>
);

// 4. Admin Login
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
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="border border-white/20 p-8 w-full max-w-md bg-black relative">
            <h2 className="font-['Syncopate'] text-2xl mb-8 text-center border-b border-white/10 pb-4">YÖNETİCİ PANELİ</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="text-xs font-mono text-gray-500 block mb-2">KULLANICI</label>
                    <input autoFocus value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-transparent border border-gray-600 p-3 text-white font-mono outline-none focus:border-white" />
                </div>
                <div>
                    <label className="text-xs font-mono text-gray-500 block mb-2">ŞİFRE</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-transparent border border-gray-600 p-3 text-white font-mono outline-none focus:border-white" />
                </div>
                {error && <div className="text-red-500 text-xs font-mono text-center">Erişim Reddedildi</div>}
                <div className="flex gap-4 pt-4">
                    <button type="button" onClick={onCancel} className="flex-1 border border-gray-800 text-gray-500 py-3 font-mono hover:text-white text-xs">[ İPTAL ]</button>
                    <button type="submit" className="flex-1 bg-white text-black py-3 font-mono font-bold text-xs hover:bg-gray-200">[ GİRİŞ YAP ]</button>
                </div>
            </form>
        </div>
    </div>
  );
};

// --- MAIN SYSTEM COMPONENT ---

const BlogSystem: React.FC<BlogSystemProps> = ({ onBack, mode }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Tabs for Admin Dashboard
  const [adminTab, setAdminTab] = useState<'settings' | 'posts'>('settings');
  
  // Post Management State
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // If we are in public mode, we just fetch posts.
    // If admin mode, we wait for login.
    if (mode === 'public') {
        fetchPosts();
    }
  }, [mode]);

  // When switching to 'posts' tab in admin, fetch posts if empty
  useEffect(() => {
    if (isAdmin && adminTab === 'posts' && posts.length === 0) {
        fetchPosts();
    }
  }, [isAdmin, adminTab]);

  const fetchPosts = async () => {
    setLoading(true);
    if (SUPABASE_URL.includes('YOUR_PROJECT_ID')) { setLoading(false); return; }
    const { data } = await supabase.from('posts').select('*').order('date', { ascending: false });
    if (data) setPosts(data);
    setLoading(false);
  };

  const handleSavePost = async (postData: Omit<BlogPost, 'id'> & { id?: string }) => {
    setIsSaving(true);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...dataToSave } = postData;
    try {
      if (postData.id) await supabase.from('posts').update(dataToSave).eq('id', postData.id);
      else await supabase.from('posts').insert([dataToSave]);
      await fetchPosts();
      setIsEditing(false);
      setSelectedPost(null);
    } catch (e: any) { alert(e.message); }
    setIsSaving(false);
  };

  const handleDeletePost = async (id: string) => {
    if (!window.confirm('Silinsin mi?')) return;
    await supabase.from('posts').delete().eq('id', id);
    fetchPosts();
  };

  if (SUPABASE_URL.includes('YOUR_PROJECT_ID')) return <ConfigWarning />;

  // --- MODE: ADMIN ---
  if (mode === 'admin') {
      if (!isAdmin) {
          return <AdminLogin onLogin={() => setIsAdmin(true)} onCancel={onBack} />;
      }

      return (
          <div className="w-full max-w-6xl mx-auto pt-8">
              <div className="flex justify-between items-center mb-8 border-b border-white/20 pb-4">
                  <h2 className="text-3xl font-['Syncopate'] text-white">YÖNETİM PANELİ</h2>
                  <div className="flex gap-4">
                     <button onClick={() => setIsAdmin(false)} className="text-red-500 text-xs font-mono hover:underline">ÇIKIŞ YAP</button>
                     <button onClick={onBack} className="text-gray-500 text-xs font-mono hover:text-white">SİTEYE DÖN</button>
                  </div>
              </div>

              <div className="flex flex-col md:flex-row gap-8">
                  {/* Sidebar / Tabs */}
                  <div className="w-full md:w-64 flex flex-col gap-2 shrink-0">
                      <button 
                        onClick={() => setAdminTab('settings')}
                        className={`text-left p-4 font-mono text-sm border ${adminTab === 'settings' ? 'bg-white text-black border-white font-bold' : 'border-gray-800 text-gray-500 hover:border-white hover:text-white'}`}
                      >
                        SİSTEM AYARLARI
                      </button>
                      <button 
                        onClick={() => setAdminTab('posts')}
                        className={`text-left p-4 font-mono text-sm border ${adminTab === 'posts' ? 'bg-white text-black border-white font-bold' : 'border-gray-800 text-gray-500 hover:border-white hover:text-white'}`}
                      >
                        BLOG YÖNETİMİ
                      </button>
                  </div>

                  {/* Content */}
                  <div className="flex-grow">
                      {adminTab === 'settings' ? (
                          <SettingsEditor />
                      ) : (
                          // BLOG MANAGEMENT AREA
                          <div className="space-y-6">
                              {isEditing ? (
                                  <Editor post={selectedPost} onSave={handleSavePost} onCancel={() => { setIsEditing(false); setSelectedPost(null); }} isSaving={isSaving} />
                              ) : (
                                  <>
                                    <div className="flex justify-between items-center bg-gray-900 p-4 border border-gray-800">
                                        <span className="text-xs text-gray-400 font-mono">TOPLAM YAZI: {posts.length}</span>
                                        <button onClick={() => { setSelectedPost(null); setIsEditing(true); }} className="bg-green-600 text-black px-4 py-2 text-xs font-bold font-mono hover:bg-green-500">+ YENİ YAZI</button>
                                    </div>
                                    <div className="grid gap-4">
                                        {posts.map(post => (
                                            <div key={post.id} className="border border-white/10 p-4 flex justify-between items-center bg-black hover:bg-gray-900">
                                                <div>
                                                    <h4 className="text-white font-bold">{post.title}</h4>
                                                    <div className="text-xs text-gray-500 font-mono mt-1">{post.date} - {post.author}</div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button onClick={() => { setSelectedPost(post); setIsEditing(true); }} className="text-blue-400 hover:text-white text-xs px-2 py-1 border border-blue-900">DÜZENLE</button>
                                                    <button onClick={() => handleDeletePost(post.id)} className="text-red-500 hover:text-white text-xs px-2 py-1 border border-red-900">SİL</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                  </>
                              )}
                          </div>
                      )}
                  </div>
              </div>
          </div>
      );
  }

  // --- MODE: PUBLIC BLOG ---
  return (
    <div className="max-w-5xl mx-auto pt-12">
        {selectedPost ? (
            <BlogPostView post={selectedPost} onBack={() => setSelectedPost(null)} />
        ) : (
            <>
               <div className="flex justify-between items-end border-b border-white/20 pb-4 mb-12">
                  <h2 className="text-4xl font-['Syncopate'] font-bold text-white">BLOG</h2>
                  <button onClick={onBack} className="text-xs text-gray-500 font-mono hover:text-white">ANA SAYFA</button>
               </div>
               
               {loading ? <RetroLoader /> : (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {posts.map(post => (
                        <div key={post.id} onClick={() => setSelectedPost(post)} className="group border border-white/20 bg-black/40 p-6 cursor-pointer hover:bg-white/5 transition-all">
                           <div className="text-xs text-green-500 font-mono mb-2">{post.date}</div>
                           <h3 className="text-2xl font-['Syncopate'] font-bold mb-4 group-hover:text-green-400 transition-colors">{post.title}</h3>
                           <p className="text-gray-400 font-mono text-sm line-clamp-3">{post.excerpt}</p>
                           <div className="mt-4 text-right text-xs text-gray-600 group-hover:text-white font-mono">OKU &gt;</div>
                        </div>
                      ))}
                   </div>
               )}
            </>
        )}
    </div>
  );
};

export default BlogSystem;
