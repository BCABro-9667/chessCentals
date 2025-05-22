// src/types/blog.ts
export const blogCategories = ['Tournament News', 'Game Analysis', 'Chess Tips', 'Community Spotlight', 'General'] as const;

export type BlogCategory = typeof blogCategories[number];

export interface BlogPost {
  id: string; // MongoDB ObjectId as string
  title: string;
  slug: string; // URL-friendly identifier
  imageUrl?: string;
  category: BlogCategory;
  tags: string[]; // Array of tag strings
  content: string; // Plain text content
  createdAt: string; // ISO Date string
  updatedAt: string; // ISO Date string
  authorEmail: string; // Added for data ownership
}

// For creating a new post, ID, createdAt, updatedAt are handled by backend
export type NewBlogPost = Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>;
