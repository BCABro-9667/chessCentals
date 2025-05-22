// src/hooks/useBlogPosts.ts
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { BlogPost, NewBlogPost } from '@/types/blog';

export function useBlogPosts() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(false); // Set to false initially
  const [error, setError] = useState<string | null>(null);

  const fetchBlogPosts = useCallback(async (authorEmail?: string | null) => {
    setIsLoading(true);
    setError(null);
    try {
      let url = '/api/blog/posts';
      if (authorEmail) {
        url += `?authorEmail=${encodeURIComponent(authorEmail)}`;
      }
      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({message: 'Failed to fetch blog posts'}));
        throw new Error(errorData.message || 'Failed to fetch blog posts');
      }
      const data: BlogPost[] = await response.json();
      setBlogPosts(data);
    } catch (err) {
      console.error(err);
      setError((err as Error).message);
      setBlogPosts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Removed automatic initial fetch. Pages are now responsible for calling fetchBlogPosts.

  const addBlogPost = useCallback(async (postData: NewBlogPost & { authorEmail: string }): Promise<BlogPost> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/blog/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add blog post');
      }
      const newPost: BlogPost = await response.json();
      await fetchBlogPosts(postData.authorEmail); 
      return newPost;
    } catch (err) {
      console.error(err);
      setError((err as Error).message);
      throw err; 
    } finally {
      setIsLoading(false);
    }
  }, [fetchBlogPosts]);

  const getBlogPostBySlug = useCallback(async (slug: string): Promise<BlogPost | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/blog/posts/${slug}`);
      if (!response.ok) {
        if (response.status === 404) return null;
        const errorData = await response.json().catch(() => ({message: `Failed to fetch blog post with slug ${slug}`}));
        throw new Error(errorData.message || `Failed to fetch blog post with slug ${slug}`);
      }
      const data: BlogPost = await response.json();
      return data;
    } catch (err) {
      console.error(err);
      setError((err as Error).message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getBlogPostByIdForEdit = useCallback(async (id: string): Promise<BlogPost | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/blog/${id}`); 
      if (!response.ok) {
        if (response.status === 404) return null;
        const errorData = await response.json().catch(() => ({message: `Failed to fetch blog post with ID ${id} for editing`}));
        throw new Error(errorData.message || `Failed to fetch blog post with ID ${id} for editing`);
      }
      const data: BlogPost = await response.json();
      return data;
    } catch (err) {
      console.error(err);
      setError((err as Error).message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateBlogPost = useCallback(async (id: string, postData: Partial<NewBlogPost & { authorEmail: string }>): Promise<BlogPost> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/blog/${id}`, { 
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update blog post');
      }
      const updatedPost: BlogPost = await response.json();
      const emailToFetch = postData.authorEmail || updatedPost.authorEmail;
      await fetchBlogPosts(emailToFetch);
      return updatedPost;
    } catch (err) {
      console.error(err);
      setError((err as Error).message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchBlogPosts]);

  const deleteBlogPost = useCallback(async (id: string, authorEmail?: string | null): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/blog/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete blog post');
      }
      await fetchBlogPosts(authorEmail); 
    } catch (err) {
      console.error(err);
      setError((err as Error).message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchBlogPosts]);

  return {
    blogPosts,
    isLoadingBlogPosts: isLoading,
    errorBlogPosts: error,
    fetchBlogPosts, 
    addBlogPost,
    getBlogPostBySlug,
    getBlogPostByIdForEdit,
    updateBlogPost,
    deleteBlogPost,
  };
}
