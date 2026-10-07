export type ProjectFormat = 'auto' | '9:16' | '3:4' | '1:1' | '16:9';

export type Project = {
  id: string;
  title: string;
  slug: string;
  category: string;
  format: ProjectFormat;
  year: number | null;
  client: string | null;
  role: string | null;
  intro: string | null;
  challenge: string | null;
  direction: string | null;
  result: string | null;
  cover_url: string;
  gallery_urls: string[];
  video_url: string | null;
  credits: string | null;
  featured: boolean;
  published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};
