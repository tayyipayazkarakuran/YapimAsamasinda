
export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  author: string;
  readTime: string;
  tags?: string[];
}

export interface SiteConfig {
  id?: number;
  site_title: string;
  site_description: string;
  meta_keywords: string;
  robots_txt: string;
  footer_text?: string;
}
