
import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { marked } from 'marked';
import { BlogPost, SiteConfig, Page, Category, Comment } from '../types';

// --- SUPABASE CONFIGURATION ---
const SUPABASE_URL = 'https://cjztgxndnfjdvzlfhvxt.supabase.co'; 
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqenRneG5kbmZqZHZ6bGZodnh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5NDExMjksImV4cCI6MjA3OTUxNzEyOX0.fBwLYwJIRMmwjrs0fsxDeqt89oqhI_uIq8UrXdL3bDA'; 

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

interface BlogSystemProps {
  onBack: () => void;
  mode: 'public' | 'admin';
  placeholderComponent?: React.ReactNode;
}

marked.use({ breaks: true, gfm: true });

// --- TOAST NOTIFICATION SYSTEM (CENTERED MODAL STYLE) ---
interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

const ToastContainer: React.FC<{ toasts: Toast[] }> = ({ toasts }) => {
  if (toasts.length === 0) return null;
  
  // Sadece en son gelen mesajı göster (üst üste binmemesi için)
  const latestToast = toasts[toasts.length - 1];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-none animate-in fade-in duration-200">
      <div className={`pointer-events-auto relative max-w-md w-[90%] p-1 border-2 bg-black/90 shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-200 ${
          latestToast.type === 'success' ? 'border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.2)]' : 
          latestToast.type === 'error' ? 'border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.2)]' : 
          'border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.2)]'
        }`}>
          
          {/* Retro Header Bar */}
          <div className={`flex justify-between items-center px-4 py-2 border-b ${
            latestToast.type === 'success' ? 'bg-green-900/30 border-green-500 text-green-400' :
            latestToast.type === 'error' ? 'bg-red-900/30 border-red-500 text-red-400' :
            'bg-blue-900/30 border-blue-500 text-blue-400'
          }`}>
             <span className="font-bold font-mono text-xs uppercase tracking-widest flex items-center gap-2">
                {latestToast.type === 'success' && <span>[ OK ]</span>}
                {latestToast.type === 'error' && <span>[ ERR ]</span>}
                {latestToast.type === 'info' && <span>[ INFO ]</span>}
                {latestToast.type === 'success' ? 'İŞLEM BAŞARILI' : latestToast.type === 'error' ? 'SİSTEM HATASI' : 'SİSTEM MESAJI'}
             </span>
             <div className="w-2 h-2 rounded-full bg-current animate-pulse shadow-[0_0_5px_currentColor]"></div>
          </div>

          {/* Content Body */}
          <div className="px-8 py-8 text-center flex flex-col items-center justify-center min-h-[120px]">
             <p className="font-mono text-white text-sm md:text-lg leading-relaxed tracking-wide">
               {latestToast.message}
             </p>
          </div>

          {/* Footer Info */}
          <div className="px-2 py-1 flex justify-between text-[8px] font-mono text-gray-500 uppercase border-t border-white/10 bg-black">
             <span>MSG_ID: {latestToast.id.toString().slice(-6)}</span>
             <span>AUTO_CLOSE_SEQUENCE_INIT...</span>
          </div>

          {/* Decorative Corners */}
          <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-white opacity-50"></div>
          <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-white opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-white opacity-50"></div>
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-white opacity-50"></div>
      </div>
    </div>
  );
};

// --- CUSTOM RETRO STYLES FOR MARKDOWN CONTENT ---
const RetroMarkdownStyles = () => (
  <style>{`
    .retro-content {
      font-family: 'Space Mono', monospace;
      color: #e5e5e5;
    }
    
    /* Headings */
    .retro-content h1, .retro-content h2, .retro-content h3 {
      font-family: 'Syncopate', sans-serif;
      font-weight: 700;
      text-transform: uppercase;
      margin-top: 2em;
      margin-bottom: 0.8em;
      color: #fff;
      border-bottom: 1px solid #333;
      padding-bottom: 0.2em;
    }
    .retro-content h1 { font-size: 1.8em; border-bottom: 2px solid #fff; }
    .retro-content h2 { font-size: 1.4em; color: #4ade80; border-bottom: 1px dashed #4ade80; }
    .retro-content h3 { font-size: 1.1em; color: #ccc; }

    /* Paragraphs & Lists */
    .retro-content p { margin-bottom: 1.5em; line-height: 1.8; }
    .retro-content ul { list-style: square; padding-left: 1.5em; margin-bottom: 1.5em; color: #aaa; }
    .retro-content ol { list-style: decimal; padding-left: 1.5em; margin-bottom: 1.5em; color: #aaa; }
    .retro-content li { margin-bottom: 0.5em; }

    /* Links */
    .retro-content a {
      color: #4ade80;
      text-decoration: none;
      border-bottom: 1px solid transparent;
      transition: all 0.2s;
    }
    .retro-content a:hover {
      background: #4ade80;
      color: #000;
    }

    /* Blockquotes - System Alert Style */
    .retro-content blockquote {
      border-left: 4px solid #4ade80;
      background: rgba(74, 222, 128, 0.05);
      padding: 1rem;
      margin: 2rem 0;
      font-style: italic;
      color: #a3a3a3;
      position: relative;
    }
    .retro-content blockquote:before {
      content: '>> SYSTEM_NOTE:';
      display: block;
      font-size: 0.7em;
      font-weight: bold;
      color: #4ade80;
      margin-bottom: 0.5rem;
    }

    /* Code Blocks - Terminal Style */
    .retro-content pre {
      background: #000;
      border: 1px solid #333;
      padding: 1rem;
      overflow-x: auto;
      margin: 1.5rem 0;
    }
    .retro-content code {
      font-family: 'Courier New', monospace;
      font-size: 0.9em;
      color: #fff;
    }
    .retro-content p code {
      background: #222;
      padding: 0.2em 0.4em;
      border-radius: 2px;
      color: #4ade80;
    }

    /* Images - Frame Style */
    .retro-content img {
      max-width: 100%;
      height: auto;
      border: 1px solid #fff;
      padding: 4px;
      margin: 2rem auto;
      display: block;
      filter: grayscale(100%); /* Retro feel */
      transition: filter 0.3s;
    }
    .retro-content img:hover {
      filter: grayscale(0%);
    }

    /* Tables - Data Grid Style */
    .retro-content table {
      width: 100%;
      border-collapse: collapse;
      margin: 2rem 0;
      font-size: 0.9em;
    }
    .retro-content th {
      border: 1px solid #444;
      padding: 12px;
      text-align: left;
      background: #111;
      color: #4ade80;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .retro-content td {
      border: 1px solid #333;
      padding: 12px;
      color: #ccc;
    }
    .retro-content tr:nth-child(even) {
      background: rgba(255,255,255,0.02);
    }

    /* Horizontal Rule */
    .retro-content hr {
      border: 0;
      height: 1px;
      background: #333;
      margin: 3rem 0;
      position: relative;
    }
    .retro-content hr:after {
      content: '/// SECTION_BREAK ///';
      position: absolute;
      left: 50%;
      top: -0.7em;
      transform: translateX(-50%);
      background: #050505;
      padding: 0 10px;
      font-size: 0.6em;
      color: #555;
    }
  `}</style>
);

// --- HELPER: Async Markdown Renderer ---
const MarkdownRenderer: React.FC<{ content: string; className?: string }> = ({ content, className }) => {
  const [html, setHtml] = useState('');

  useEffect(() => {
    Promise.resolve(marked.parse(content || '')).then((parsed) => {
      setHtml(parsed as string);
    });
  }, [content]);

  return (
    <>
      <RetroMarkdownStyles />
      <div className={`retro-content ${className || ''}`} dangerouslySetInnerHTML={{ __html: html }} />
    </>
  );
};

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
      <p className="text-white mb-6">Veritabanı bağlantı bilgileri eksik veya tablo bulunamadı.</p>
      <p className="text-gray-500 text-xs">Admin panelinde 'VERİTABANI' sekmesine giderek gerekli SQL kodlarını alabilirsiniz.</p>
    </div>
  </div>
);

// --- ADMIN SUB-COMPONENTS ---

// 1. Settings Editor
const SettingsEditor: React.FC<{ notify: (msg: string, type: 'success'|'error') => void }> = ({ notify }) => {
  const [config, setConfig] = useState<SiteConfig>({
    site_title: '',
    site_description: '',
    meta_keywords: '',
    robots_txt: '',
    footer_text: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    setDbError(null);
    const { data, error } = await supabase.from('site_settings').select('*').single();
    if (error) {
       if (error.code !== 'PGRST116') {
         setDbError(error.message);
       }
    }
    if (data) setConfig(data);
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setDbError(null);
    
    // First, check if settings exist
    const { data: existing } = await supabase.from('site_settings').select('id').single();
    
    let error;
    if (existing) {
       const { error: err } = await supabase.from('site_settings').update(config).eq('id', existing.id);
       error = err;
    } else {
       const { error: err } = await supabase.from('site_settings').insert([config]);
       error = err;
    }

    if (error) {
        setDbError(error.message);
        notify('Kayıt Başarısız: ' + error.message, 'error');
    } else {
        notify('Sistem Ayarları Güncellendi.', 'success');
    }
    
    setSaving(false);
  };

  if (loading) return <RetroLoader />;

  return (
    <div className="max-w-2xl mx-auto border border-white/20 p-8 bg-black/50">
       <h3 className="font-['Syncopate'] text-2xl mb-6 border-b border-white/20 pb-4">SİSTEM YAPILANDIRMASI</h3>
       {dbError && <div className="bg-red-900/50 border border-red-500 p-4 mb-6 text-xs font-mono text-white">
          <p className="font-bold">VERİTABANI HATASI:</p>
          <p>{dbError}</p>
          <p className="mt-2 text-gray-300">Lütfen 'VERİTABANI / SQL' sekmesinden eksik tabloları veya sütunları onarın.</p>
       </div>}

       <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-xs font-mono text-green-400">SITE_TITLE (Browser)</label>
            <input value={config.site_title || ''} onChange={e => setConfig({...config, site_title: e.target.value})} className="w-full bg-black border border-gray-700 p-3 text-white font-mono outline-none focus:border-green-500" />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-mono text-green-400">META_DESCRIPTION</label>
            <textarea value={config.site_description || ''} onChange={e => setConfig({...config, site_description: e.target.value})} className="w-full bg-black border border-gray-700 p-3 text-white font-mono outline-none focus:border-green-500 h-24" />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-mono text-green-400">FOOTER TEXT</label>
            <input value={config.footer_text || ''} onChange={e => setConfig({...config, footer_text: e.target.value})} className="w-full bg-black border border-gray-700 p-3 text-white font-mono outline-none focus:border-green-500" />
          </div>
          <div className="pt-4">
             <button type="submit" disabled={saving} className="bg-green-600 text-black px-6 py-3 font-bold hover:bg-green-500 w-full font-mono uppercase">{saving ? 'KAYDEDİLİYOR...' : '[ AYARLARI KAYDET ]'}</button>
          </div>
       </form>
    </div>
  );
}

// 2. Universal Editor (For Posts and Pages)
const Editor: React.FC<{ 
  initialData?: any; 
  type: 'post' | 'page';
  categories: Category[];
  onSave: (data: any) => void; 
  onCancel: () => void; 
  isSaving: boolean;
}> = ({ initialData, type, categories, onSave, onCancel, isSaving }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [tagsInput, setTagsInput] = useState(initialData?.tags ? initialData.tags.join(', ') : '');
  const [categoryId, setCategoryId] = useState(initialData?.category_id || '');
  const [isVisible, setIsVisible] = useState(initialData?.is_visible !== false); // Default true
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-generate slug from title if empty
  useEffect(() => {
    if (!initialData && !slug && title) {
      setSlug(title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''));
    }
  }, [title]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tags = tagsInput.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag.length > 0);
    const finalSlug = slug.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
    
    const payload: any = {
      id: initialData?.id,
      title,
      content,
      slug: finalSlug,
    };

    if (type === 'post') {
        payload.excerpt = excerpt;
        payload.date = initialData?.date || new Date().toISOString().split('T')[0];
        payload.author = 'KARAKURAN';
        payload.readTime = Math.ceil(content.split(' ').length / 200) + ' DAK';
        payload.tags = tags;
        if (categoryId) payload.category_id = categoryId;
    } else {
        payload.created_at = initialData?.created_at || new Date().toISOString();
        payload.is_visible = isVisible;
        if (categoryId) payload.category_id = categoryId;
    }

    onSave(payload);
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
        <button type="button" onClick={() => setActiveTab('write')} className={`px-6 py-2 text-xs font-mono font-bold ${activeTab === 'write' ? 'bg-black text-green-400' : 'text-gray-500'}`}>[ EDİTÖR: {type.toUpperCase()} ]</button>
        <button type="button" onClick={() => setActiveTab('preview')} className={`px-6 py-2 text-xs font-mono font-bold ${activeTab === 'preview' ? 'bg-black text-white' : 'text-gray-500'}`}>[ ÖNİZLEME ]</button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-black border border-gray-700 text-white p-3 font-mono text-lg outline-none focus:border-green-500 md:col-span-2" placeholder="BAŞLIK..." required />
            
            <input value={slug} onChange={e => setSlug(e.target.value)} className="w-full bg-black border border-gray-700 text-blue-400 p-3 font-mono text-sm outline-none focus:border-blue-500" placeholder="URL-SLUG (örn: hakkimizda)..." required />
            
            <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full bg-black border border-gray-700 text-white p-3 font-mono text-sm outline-none focus:border-green-500">
              <option value="">-- KATEGORİ SEÇ --</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            {type === 'post' && (
                <>
                    <input value={excerpt} onChange={e => setExcerpt(e.target.value)} className="w-full bg-black border border-gray-700 text-gray-300 p-3 font-mono text-sm outline-none focus:border-green-500 md:col-span-2" placeholder="ÖZET (Ana sayfada görünür)..." required />
                    <input value={tagsInput} onChange={e => setTagsInput(e.target.value)} className="w-full bg-black border border-gray-700 text-green-400 p-3 font-mono text-sm outline-none focus:border-green-500 md:col-span-2" placeholder="ETİKETLER (Virgül ile ayır)..." />
                </>
            )}

            {type === 'page' && (
                <div className="flex items-center gap-2 border border-gray-700 p-3">
                   <input type="checkbox" checked={isVisible} onChange={e => setIsVisible(e.target.checked)} id="vis" className="accent-green-500" />
                   <label htmlFor="vis" className="text-white font-mono text-sm cursor-pointer">MENÜDE GÖSTER</label>
                </div>
            )}
        </div>

        {activeTab === 'write' ? (
            <div className="group relative">
              <div className="flex flex-wrap gap-2 mb-2 bg-gray-900/50 p-2 border border-gray-800">
                 <button type="button" onClick={() => wrapSelection('**', '**')} className="border px-2 py-1 text-xs text-gray-300 hover:text-white">BOLD</button>
                 <button type="button" onClick={() => wrapSelection('*', '*')} className="border px-2 py-1 text-xs text-gray-300 hover:text-white">ITALIC</button>
                 <button type="button" onClick={() => insertTextAtCursor('# ', 2)} className="border px-2 py-1 text-xs text-gray-300 hover:text-white">H1</button>
                 <button type="button" onClick={() => insertTextAtCursor('## ', 3)} className="border px-2 py-1 text-xs text-gray-300 hover:text-white">H2</button>
                 <button type="button" onClick={() => wrapSelection('\n> ', '\n')} className="border px-2 py-1 text-xs text-gray-300 hover:text-white">QUOTE</button>
                 <button type="button" onClick={() => wrapSelection('\n```\n', '\n```\n')} className="border px-2 py-1 text-xs text-gray-300 hover:text-white">CODE</button>
                 <button type="button" onClick={() => {const u = prompt('Görsel URL:'); if(u) insertTextAtCursor(`\n![Img](${u})\n`)}} className="border px-2 py-1 text-xs text-green-400 border-green-900 hover:bg-green-900">IMG</button>
              </div>
              <textarea ref={textareaRef} value={content} onChange={e => setContent(e.target.value)} className="w-full h-[400px] bg-[#050505] border border-gray-700 p-4 font-mono text-sm text-gray-300 outline-none focus:border-green-500" placeholder="İçerik..." required />
            </div>
        ) : (
            <div className="w-full h-[450px] bg-[#050505] border border-gray-700 p-8 overflow-y-auto">
               <RetroMarkdownStyles />
               <MarkdownRenderer content={content} />
            </div>
        )}

        <div className="flex justify-end gap-4">
          <button type="button" onClick={onCancel} className="text-gray-500 hover:text-white px-4 py-2 font-mono text-xs">[ İPTAL ]</button>
          <button type="submit" disabled={isSaving} className="bg-white text-black px-6 py-2 font-bold hover:bg-gray-300 font-mono text-xs uppercase">{isSaving ? 'KAYDEDİLİYOR...' : '[ YAYINLA ]'}</button>
        </div>
      </form>
    </div>
  );
};

// 3. Category Manager
const CategoryManager: React.FC<{ notify: (m:string, t:'success'|'error')=>void }> = ({ notify }) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [newCat, setNewCat] = useState('');

    useEffect(() => { fetchCats(); }, []);
    const fetchCats = async () => {
        const { data } = await supabase.from('categories').select('*');
        if (data) setCategories(data);
    };
    const handleAdd = async () => {
        if (!newCat.trim()) return;
        const slug = newCat.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const { error } = await supabase.from('categories').insert([{ name: newCat.trim(), slug: slug }]);
        if(error) notify(error.message, 'error');
        else {
          notify('Kategori Eklendi', 'success');
          setNewCat('');
          fetchCats();
        }
    };
    const handleDelete = async (id: string) => {
        const { error } = await supabase.from('categories').delete().eq('id', id);
        if(error) notify(error.message, 'error');
        else {
          notify('Kategori Silindi', 'info');
          fetchCats();
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-8 bg-black/50 border border-white/20">
            <h3 className="font-['Syncopate'] text-xl mb-6 border-b border-white/20 pb-4">KATEGORİ YÖNETİMİ</h3>
            <div className="flex gap-2 mb-6">
                <input value={newCat} onChange={e => setNewCat(e.target.value)} className="flex-grow bg-black border border-gray-700 p-2 text-white font-mono" placeholder="Yeni Kategori Adı..." />
                <button onClick={handleAdd} className="bg-green-600 text-black px-4 font-bold font-mono text-xs">EKLE</button>
            </div>
            <div className="grid gap-2">
                {categories.map(cat => (
                    <div key={cat.id} className="flex justify-between items-center border border-gray-800 p-3 hover:bg-white/5">
                        <span className="font-mono text-white">{cat.name}</span>
                        <button onClick={() => handleDelete(cat.id)} className="text-red-500 text-xs">[SİL]</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

// 4. Comment Manager (Admin)
const CommentManager: React.FC = () => {
    const [comments, setComments] = useState<Comment[]>([]);
    useEffect(() => { fetchComments(); }, []);
    const fetchComments = async () => {
        const { data } = await supabase.from('comments').select('*').order('created_at', { ascending: false });
        if (data) setComments(data);
    };
    const handleToggle = async (id: string, current: boolean) => {
        await supabase.from('comments').update({ is_approved: !current }).eq('id', id);
        fetchComments();
    };
    const handleDelete = async (id: string) => {
        if(!confirm('Silinsin mi?')) return;
        await supabase.from('comments').delete().eq('id', id);
        fetchComments();
    };

    return (
        <div className="max-w-4xl mx-auto p-8 bg-black/50 border border-white/20">
            <h3 className="font-['Syncopate'] text-xl mb-6 border-b border-white/20 pb-4">YORUM YÖNETİMİ</h3>
            <div className="space-y-4">
                {comments.length === 0 && <div className="text-gray-500 font-mono">Yorum yok.</div>}
                {comments.map(c => (
                    <div key={c.id} className={`p-4 border ${c.is_approved ? 'border-green-900 bg-green-900/10' : 'border-yellow-900 bg-yellow-900/10'}`}>
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <div className="font-bold text-white text-sm">{c.author_name} <span className="text-gray-500 font-normal text-xs">({c.ip_address})</span></div>
                                <div className="text-[10px] text-gray-500">{new Date(c.created_at).toLocaleString()}</div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleToggle(c.id, c.is_approved)} className={`text-xs px-2 py-1 border ${c.is_approved ? 'border-yellow-500 text-yellow-500' : 'border-green-500 text-green-500'}`}>
                                    {c.is_approved ? 'ONAYI KALDIR' : 'ONAYLA'}
                                </button>
                                <button onClick={() => handleDelete(c.id)} className="text-xs px-2 py-1 border border-red-500 text-red-500">SİL</button>
                            </div>
                        </div>
                        <p className="text-gray-300 font-mono text-sm">{c.content}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

// 5. Database Tools (SQL Helper)
const DatabaseTools: React.FC = () => {
  const sqlCreateTables = `
-- 1. TABLOLARI OLUŞTUR
create table if not exists public.categories (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text not null,
  created_at timestamptz default now()
);

create table if not exists public.pages (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text not null unique,
  content text,
  created_at timestamptz default now(),
  is_visible boolean default true
);

create table if not exists public.posts (
  id uuid default gen_random_uuid() primary key,
  title text,
  slug text,
  excerpt text,
  content text,
  date text,
  author text,
  "readTime" text,
  tags text[],
  category_id uuid references public.categories(id),
  created_at timestamptz default now()
);

create unique index if not exists posts_slug_idx on public.posts (slug);

create table if not exists public.comments (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.posts(id) on delete cascade,
  page_id uuid references public.pages(id) on delete cascade,
  author_name text,
  content text,
  ip_address text,
  is_approved boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.site_settings (
  id bigint generated by default as identity primary key,
  site_title text,
  site_description text,
  meta_keywords text,
  robots_txt text,
  footer_text text,
  created_at timestamptz default now()
);
  `.trim();

  const sqlFixColumns = `
-- EKSİK SÜTUNLARI DÜZELT (Hata alırsanız bunu çalıştırın)
alter table public.site_settings add column if not exists footer_text text;

alter table public.posts add column if not exists tags text[];
alter table public.posts add column if not exists category_id uuid references public.categories(id);
alter table public.posts add column if not exists slug text;

alter table public.pages add column if not exists is_visible boolean default true;
alter table public.pages add column if not exists category_id uuid references public.categories(id);

alter table public.categories add column if not exists slug text;
  `.trim();

  const sqlPermissions = `
-- İZİNLERİ AÇ (RLS)
alter table public.categories enable row level security;
alter table public.pages enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.site_settings enable row level security;

drop policy if exists "Enable all" on public.categories;
create policy "Enable all" on public.categories for all using (true) with check (true);

drop policy if exists "Enable all" on public.pages;
create policy "Enable all" on public.pages for all using (true) with check (true);

drop policy if exists "Enable all" on public.posts;
create policy "Enable all" on public.posts for all using (true) with check (true);

drop policy if exists "Enable all" on public.comments;
create policy "Enable all" on public.comments for all using (true) with check (true);

drop policy if exists "Enable all" on public.site_settings;
create policy "Enable all" on public.site_settings for all using (true) with check (true);
  `.trim();

  return (
    <div className="max-w-4xl mx-auto p-8 bg-black/50 border border-white/20 font-mono">
       <h3 className="font-['Syncopate'] text-xl mb-6 text-yellow-500 border-b border-yellow-500/30 pb-4">VERİTABANI / SQL ARAÇLARI</h3>
       
       <p className="text-sm text-gray-400 mb-6">Aşağıdaki kodları Supabase paneline gidip <b>SQL Editor</b> kısmında çalıştırarak eksik tabloları ve hataları düzeltebilirsiniz.</p>

       <div className="space-y-8">
          <div>
            <h4 className="text-green-500 font-bold mb-2 text-sm">A. EKSİK SÜTUNLARI ONAR (GÜNCELLEME)</h4>
            <textarea readOnly className="w-full h-32 bg-gray-900 border border-green-900 text-green-300 p-4 text-xs font-mono focus:outline-none" value={sqlFixColumns} />
          </div>

          <div>
             <h4 className="text-blue-500 font-bold mb-2 text-sm">B. TABLOLARI OLUŞTUR (İLK KURULUM)</h4>
             <textarea readOnly className="w-full h-48 bg-gray-900 border border-blue-900 text-blue-300 p-4 text-xs font-mono focus:outline-none" value={sqlCreateTables} />
          </div>

          <div>
             <h4 className="text-purple-500 font-bold mb-2 text-sm">C. YAZMA İZİNLERİNİ AÇ (RLS)</h4>
             <textarea readOnly className="w-full h-32 bg-gray-900 border border-purple-900 text-purple-300 p-4 text-xs font-mono focus:outline-none" value={sqlPermissions} />
          </div>
       </div>
    </div>
  );
};

// 6. Public Comment Section
const CommentSection: React.FC<{ entityId: string, entityType: 'post' | 'page', notify: (m:string, t:'success'|'error')=>void }> = ({ entityId, entityType, notify }) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [name, setName] = useState('');
    const [content, setContent] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchC = async () => {
            let query = supabase.from('comments').select('*').eq('is_approved', true).order('created_at', { ascending: false });
            if (entityType === 'post') query = query.eq('post_id', entityId);
            else query = query.eq('page_id', entityId);
            
            const { data } = await query;
            if (data) setComments(data);
        };
        fetchC();
    }, [entityId, entityType]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch('https://api.ipify.org?format=json');
            const { ip } = await res.json();

            const payload: any = {
                author_name: name,
                content: content,
                ip_address: ip,
                is_approved: false
            };
            if (entityType === 'post') payload.post_id = entityId;
            else payload.page_id = entityId;

            await supabase.from('comments').insert([payload]);
            notify('Yorumunuz gönderildi! Yönetici onayından sonra yayınlanacaktır.', 'info');
            setName('');
            setContent('');
        } catch (err) {
            console.error(err);
            notify('Hata oluştu.', 'error');
        }
        setSubmitting(false);
    };

    return (
        <div className="mt-12 pt-8 border-t border-white/10">
            <h3 className="font-['Syncopate'] text-lg text-white mb-6">YORUMLAR ({comments.length})</h3>
            
            <div className="space-y-6 mb-10">
                {comments.map(c => (
                    <div key={c.id} className="bg-white/5 p-4 border-l-2 border-green-500">
                        <div className="flex justify-between mb-2">
                            <span className="font-bold text-green-400 text-sm">{c.author_name}</span>
                            <span className="text-[10px] text-gray-500">{new Date(c.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-gray-300 text-sm font-mono">{c.content}</p>
                    </div>
                ))}
                {comments.length === 0 && <p className="text-gray-600 text-xs font-mono">Henüz yorum yapılmamış.</p>}
            </div>

            <form onSubmit={handleSubmit} className="bg-black border border-gray-800 p-6">
                <h4 className="text-white font-mono text-sm mb-4">YORUM YAP</h4>
                <div className="space-y-4">
                    <input required value={name} onChange={e => setName(e.target.value)} className="w-full bg-gray-900 border border-gray-700 p-3 text-white font-mono text-sm focus:border-green-500" placeholder="İsim..." />
                    <textarea required value={content} onChange={e => setContent(e.target.value)} className="w-full bg-gray-900 border border-gray-700 p-3 text-white font-mono text-sm focus:border-green-500 h-24" placeholder="Yorumunuz..." />
                    <button disabled={submitting} type="submit" className="bg-white text-black px-6 py-2 font-bold font-mono text-xs hover:bg-gray-300">
                        {submitting ? 'GÖNDERİLİYOR...' : 'GÖNDER'}
                    </button>
                </div>
            </form>
        </div>
    );
};

// 7. Admin Login
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

const BlogSystem: React.FC<BlogSystemProps> = ({ onBack, mode, placeholderComponent }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminTab, setAdminTab] = useState<'posts' | 'pages' | 'categories' | 'comments' | 'settings' | 'database'>('posts');
  
  // Data States
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Selection State
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);
  
  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editType, setEditType] = useState<'post' | 'page'>('post');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Toast State
  const [toasts, setToasts] = useState<Toast[]>([]);

  const notify = (message: string, type: 'success' | 'error' | 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  useEffect(() => {
     fetchContent();
  }, []);

  const fetchContent = async () => {
    setLoading(true);
    if (SUPABASE_URL.includes('YOUR_PROJECT_ID')) { setLoading(false); return; }
    
    const postsReq = supabase.from('posts').select('*').order('date', { ascending: false });
    const pagesReq = supabase.from('pages').select('*').order('created_at', { ascending: true });
    const catsReq = supabase.from('categories').select('*');
    
    const [pRes, pageRes, catRes] = await Promise.all([postsReq, pagesReq, catsReq]);
    
    if (pRes.data) setPosts(pRes.data);
    if (pageRes.data) setPages(pageRes.data);
    if (catRes.data) setCategories(catRes.data);

    // Initial Routing Logic
    const path = window.location.pathname.replace(/^\/|\/$/g, '');
    if (path) {
        // Try to find matching page or post
        const matchedPage = pageRes.data?.find(p => p.slug === path);
        const matchedPost = pRes.data?.find(p => p.slug === path);
        if (matchedPage) setSelectedPage(matchedPage);
        else if (matchedPost) setSelectedPost(matchedPost);
    }
    
    setLoading(false);
  };

  const handleSelection = (item: BlogPost | Page, type: 'post' | 'page') => {
    if (type === 'post') {
        setSelectedPost(item as BlogPost);
        setSelectedPage(null);
        if ((item as BlogPost).slug) window.history.pushState({}, '', `/${(item as BlogPost).slug}`);
    } else {
        setSelectedPage(item as Page);
        setSelectedPost(null);
        window.history.pushState({}, '', `/${(item as Page).slug}`);
    }
  };

  const handleSave = async (data: any) => {
    setIsSaving(true);
    try {
      const table = editType === 'post' ? 'posts' : 'pages';
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...payload } = data;
      
      let res;
      if (data.id) res = await supabase.from(table).update(payload).eq('id', data.id);
      else res = await supabase.from(table).insert([payload]);
      
      if (res.error) throw res.error;

      await fetchContent();
      setIsEditing(false);
      setSelectedPost(null);
      setSelectedPage(null);
      notify('Kayıt Başarıyla Tamamlandı.', 'success');
    } catch (e: any) { 
        notify(e.message, 'error');
    }
    setIsSaving(false);
  };

  const handleDelete = async (id: string, type: 'post' | 'page') => {
    if (!window.confirm('Silinsin mi?')) return;
    const { error } = await supabase.from(type === 'post' ? 'posts' : 'pages').delete().eq('id', id);
    if (error) notify(error.message, 'error');
    else {
        notify('Silme İşlemi Başarılı.', 'info');
        fetchContent();
    }
  };

  if (SUPABASE_URL.includes('YOUR_PROJECT_ID')) return <ConfigWarning />;

  // --- ADMIN VIEW ---
  if (mode === 'admin') {
      if (!isAdmin) return <AdminLogin onLogin={() => setIsAdmin(true)} onCancel={onBack} />;

      return (
          <div className="w-full max-w-7xl mx-auto pt-8 px-4 h-full flex flex-col relative">
              <ToastContainer toasts={toasts} />
              <div className="flex justify-between items-center mb-8 border-b border-white/20 pb-4 shrink-0">
                  <h2 className="text-3xl font-['Syncopate'] text-white">YÖNETİM PANELİ</h2>
                  <div className="flex gap-4">
                     <button onClick={() => setIsAdmin(false)} className="text-red-500 text-xs font-mono hover:underline">ÇIKIŞ YAP</button>
                     <button onClick={onBack} className="text-gray-500 text-xs font-mono hover:text-white">SİTEYE DÖN</button>
                  </div>
              </div>

              <div className="flex flex-col md:flex-row gap-8 flex-grow overflow-hidden">
                  {/* Sidebar */}
                  <div className="w-full md:w-64 flex flex-col gap-2 shrink-0 h-full">
                      {['posts', 'pages', 'categories', 'comments'].map(tab => (
                          <button key={tab} onClick={() => { setAdminTab(tab as any); setIsEditing(false); }} className={`text-left p-4 font-mono text-sm border uppercase ${adminTab === tab ? 'bg-white text-black border-white font-bold' : 'border-gray-800 text-gray-500 hover:border-white hover:text-white'}`}>
                              {tab === 'posts' ? 'Blog Yönetimi' : tab === 'pages' ? 'Sayfa Yönetimi' : tab === 'categories' ? 'Kategoriler' : 'Yorumlar'}
                          </button>
                      ))}
                      
                      <div className="mt-auto space-y-2">
                          <button onClick={() => { setAdminTab('settings'); setIsEditing(false); }} className={`w-full text-left p-4 font-mono text-sm border ${adminTab === 'settings' ? 'bg-white text-black border-white font-bold' : 'border-gray-800 text-gray-500 hover:border-white hover:text-white'}`}>SİSTEM AYARLARI</button>
                          <button onClick={() => { setAdminTab('database'); setIsEditing(false); }} className={`w-full text-left p-4 font-mono text-sm border border-yellow-900/50 text-yellow-600 hover:text-yellow-400 hover:border-yellow-400 ${adminTab === 'database' ? 'bg-yellow-900/20 font-bold' : ''}`}>VERİTABANI / SQL</button>
                      </div>
                  </div>

                  {/* Content */}
                  <div className="flex-grow overflow-y-auto pb-10">
                      {adminTab === 'settings' && <SettingsEditor notify={notify} />}
                      {adminTab === 'categories' && <CategoryManager notify={notify} />}
                      {adminTab === 'comments' && <CommentManager />}
                      {adminTab === 'database' && <DatabaseTools />}
                      
                      {(adminTab === 'posts' || adminTab === 'pages') && (
                          <div className="space-y-6">
                              {isEditing ? (
                                  <Editor 
                                    type={editType} 
                                    initialData={editType === 'post' ? selectedPost : selectedPage} 
                                    categories={categories}
                                    onSave={handleSave} 
                                    onCancel={() => { setIsEditing(false); setSelectedPost(null); setSelectedPage(null); }} 
                                    isSaving={isSaving} 
                                  />
                              ) : (
                                  <>
                                    <div className="flex justify-between items-center bg-gray-900 p-4 border border-gray-800">
                                        <span className="text-xs text-gray-400 font-mono">
                                            {adminTab === 'posts' ? `TOPLAM YAZI: ${posts.length}` : `TOPLAM SAYFA: ${pages.length}`}
                                        </span>
                                        <button onClick={() => { 
                                            setEditType(adminTab === 'posts' ? 'post' : 'page'); 
                                            setSelectedPost(null); 
                                            setSelectedPage(null); 
                                            setIsEditing(true); 
                                        }} className="bg-green-600 text-black px-4 py-2 text-xs font-bold font-mono hover:bg-green-500">+ YENİ EKLE</button>
                                    </div>
                                    <div className="grid gap-2">
                                        {(adminTab === 'posts' ? posts : pages).map((item: any) => (
                                            <div key={item.id} className="border border-white/10 p-3 flex justify-between items-center bg-black hover:bg-gray-900">
                                                <div className="truncate pr-4 flex-grow">
                                                    <h4 className="text-white font-bold text-sm truncate">{item.title}</h4>
                                                    <div className="text-[10px] text-gray-500 font-mono flex gap-2">
                                                        <span>{adminTab === 'posts' ? item.date : `/${item.slug}`}</span>
                                                        {item.category_id && <span className="text-blue-500">[{categories.find(c => c.id === item.category_id)?.name}]</span>}
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 shrink-0">
                                                    <a href={`/${item.slug || ''}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white text-[10px] px-2 py-1 border border-gray-700">GÖRÜNTÜLE (↗)</a>
                                                    <button onClick={() => { 
                                                        setEditType(adminTab === 'posts' ? 'post' : 'page');
                                                        if(adminTab === 'posts') setSelectedPost(item); else setSelectedPage(item);
                                                        setIsEditing(true); 
                                                    }} className="text-blue-400 hover:text-white text-[10px] px-2 py-1 border border-blue-900">EDİT</button>
                                                    <button onClick={() => handleDelete(item.id, adminTab === 'posts' ? 'post' : 'page')} className="text-red-500 hover:text-white text-[10px] px-2 py-1 border border-red-900">SİL</button>
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

  // --- PUBLIC VIEW ---
  // Determines what to show in the Right Column
  const activeEntity = selectedPage || selectedPost;

  return (
    <div className="flex w-full h-full pt-4 md:pt-8 px-4 md:px-8 gap-8 overflow-hidden relative">
        <ToastContainer toasts={toasts} />
        {/* Left Column: Sidebar */}
        <div className={`w-full md:w-1/3 flex flex-col h-full border-r border-white/10 bg-black/40 backdrop-blur-sm ${activeEntity ? 'hidden md:flex' : 'flex'}`}>
            <div className="mb-6 pb-4 border-b border-white/20 shrink-0">
                <h2 className="text-2xl font-['Syncopate'] text-white">DATA_LOGS</h2>
            </div>
            
            {loading ? <RetroLoader /> : (
                <div className="overflow-y-auto pr-2 custom-scrollbar space-y-8 flex-grow">
                    
                    {/* Section: Pages */}
                    {pages.filter(p => p.is_visible !== false).length > 0 && (
                        <div>
                            <h3 className="text-xs font-bold text-gray-500 mb-3 pl-2 uppercase tracking-widest">SAYFALAR</h3>
                            <div className="space-y-1">
                                {pages.filter(p => p.is_visible !== false).map(page => (
                                    <div 
                                        key={page.id}
                                        onClick={() => handleSelection(page, 'page')}
                                        className={`cursor-pointer px-4 py-2 border-l-2 transition-all text-sm font-mono ${selectedPage?.id === page.id ? 'border-green-500 text-white bg-white/5' : 'border-transparent text-gray-400 hover:text-green-400'}`}
                                    >
                                        {page.title}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Section: Posts */}
                    <div>
                        <h3 className="text-xs font-bold text-gray-500 mb-3 pl-2 uppercase tracking-widest">BLOG YAZILARI</h3>
                        <div className="space-y-4">
                            {posts.map(post => (
                                <div 
                                   key={post.id} 
                                   onClick={() => handleSelection(post, 'post')}
                                   className={`group border cursor-pointer p-4 transition-all ${selectedPost?.id === post.id ? 'bg-white text-black border-white' : 'bg-transparent border-white/20 text-gray-300 hover:border-green-500'}`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className={`text-[10px] font-mono ${selectedPost?.id === post.id ? 'text-black' : 'text-green-500'}`}>{post.date}</span>
                                        {post.category_id && <span className="text-[9px] border border-gray-600 px-1 text-gray-400">{categories.find(c => c.id === post.category_id)?.name}</span>}
                                    </div>
                                    <h3 className="font-bold font-['Syncopate'] text-lg leading-tight mb-2">{post.title}</h3>
                                </div>
                            ))}
                            {posts.length === 0 && <div className="text-center text-gray-500 py-4 font-mono">KAYIT BULUNAMADI.</div>}
                        </div>
                    </div>

                </div>
            )}
        </div>

        {/* Right Column: Content Viewer */}
        <div className={`w-full md:w-2/3 h-full relative overflow-hidden ${activeEntity ? 'block' : 'hidden md:block'}`}>
            {activeEntity ? (
                <div className="w-full h-full animate-in fade-in zoom-in duration-300 overflow-y-auto custom-scrollbar pr-4 pb-20">
                    <button onClick={() => { setSelectedPost(null); setSelectedPage(null); window.history.pushState({}, '', '/'); }} className="md:hidden mb-4 text-xs text-green-500 font-mono border border-green-900 px-2 py-1">&lt; MENÜ</button>
                    
                    {/* Render Post or Page */}
                    <article className="border-b border-white/10 pb-8 mb-8">
                        <header className="mb-8">
                            {selectedPost && (
                                <div className="flex justify-between items-start mb-2">
                                    <div className="text-xs text-green-500 font-mono uppercase">{selectedPost.date} // {selectedPost.author}</div>
                                    <div className="text-xs text-gray-500">{selectedPost.readTime}</div>
                                </div>
                            )}
                            <h1 className="text-3xl md:text-5xl font-black font-['Syncopate'] leading-tight mb-4 text-white uppercase">
                                {activeEntity.title}
                            </h1>
                            {selectedPost?.category_id && (
                                <div className="mb-4">
                                    <span className="text-xs bg-green-900/30 text-green-400 px-2 py-1 border border-green-900 font-mono">
                                        {categories.find(c => c.id === selectedPost.category_id)?.name}
                                    </span>
                                </div>
                            )}
                            {selectedPost?.tags && (
                                <div className="flex flex-wrap gap-2">
                                    {selectedPost.tags.map((tag, i) => <span key={i} className="text-[10px] bg-white/5 border border-white/10 px-2 py-1 text-gray-300 font-mono">#{tag}</span>)}
                                </div>
                            )}
                        </header>
                        
                        {/* Content */}
                        <div className="pb-8">
                            {selectedPost && <p className="font-mono text-lg text-white font-bold italic mb-8 border-l-4 border-green-500 pl-4 bg-white/5 p-4">{selectedPost.excerpt}</p>}
                            <MarkdownRenderer content={activeEntity.content} />
                        </div>
                    </article>

                    {/* Comment System */}
                    <CommentSection notify={notify} entityId={activeEntity.id} entityType={selectedPost ? 'post' : 'page'} />
                </div>
            ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-center opacity-80 pointer-events-none">
                     <div className="scale-75 md:scale-100 pointer-events-auto">
                        {placeholderComponent}
                     </div>
                     <div className="mt-8 font-mono text-green-500 animate-pulse bg-black/50 p-2 border border-green-900">
                         &lt; LÜTFEN BİR VERİ AKIŞI SEÇİNİZ &gt;
                     </div>
                </div>
            )}
        </div>
        
        <style>{`
          .custom-scrollbar::-webkit-scrollbar { width: 6px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #555; }
        `}</style>
    </div>
  );
};

export default BlogSystem;
