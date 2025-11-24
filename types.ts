
export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug?: string;
  excerpt: string;
  content: string;
  date: string;
  author: string;
  readTime: string;
  tags?: string[];
  category_id?: string;
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  created_at: string;
  is_visible?: boolean;
}

export interface Comment {
  id: string;
  post_id?: string;
  page_id?: string;
  author_name: string;
  content: string;
  ip_address: string;
  created_at: string;
  is_approved: boolean;
}

export interface SiteConfig {
  id?: number;
  site_title: string;
  site_description: string;
  meta_keywords: string;
  robots_txt: string;
  footer_text?: string;
}
