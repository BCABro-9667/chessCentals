// src/app/dashboard/blog-management/[id]/edit/page.tsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter, notFound } from 'next/navigation';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import { useToast } from '@/hooks/use-toast';
import type { BlogPost, NewBlogPost, BlogCategory } from '@/types/blog';
import { blogCategories } from '@/types/blog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Save, Loader2, Edit3, ImageIcon, TagsIcon, Type, GripVertical } from 'lucide-react';
import Link from 'next/link';

const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

export default function EditBlogPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;

  const { getBlogPostByIdForEdit, updateBlogPost, isLoadingBlogPosts } = useBlogPosts();
  const { toast } = useToast();

  const [initialLoading, setInitialLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [category, setCategory] = useState<BlogCategory | "">("");
  const [tags, setTags] = useState(""); // Comma-separated string
  const [content, setContent] = useState("");
  const [originalPost, setOriginalPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    if (postId) {
      const fetchPost = async () => {
        setInitialLoading(true);
        const postData = await getBlogPostByIdForEdit(postId);
        if (postData) {
          setOriginalPost(postData);
          setTitle(postData.title);
          setSlug(postData.slug);
          setImageUrl(postData.imageUrl || "");
          setCategory(postData.category);
          setTags(postData.tags.join(', '));
          setContent(postData.content);
        } else {
          setOriginalPost(null); // Indicate not found
        }
        setInitialLoading(false);
      };
      fetchPost();
    }
  }, [postId, getBlogPostByIdForEdit]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    // Optionally, only auto-update slug if user hasn't manually changed it from original or if it's empty
    if (slug === generateSlug(originalPost?.title || "") || slug === "") {
        setSlug(generateSlug(newTitle));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlug(generateSlug(e.target.value)); // Ensure slug is always URL-friendly
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !slug.trim() || !category || !content.trim()) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in Title, Slug, Category, and Content.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    const postData: Partial<NewBlogPost> = {
      title,
      slug,
      imageUrl: imageUrl.trim() || undefined,
      category: category as BlogCategory,
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      content,
    };

    try {
      await updateBlogPost(postId, postData);
      toast({
        title: "Blog Post Updated!",
        description: `"${title}" has been successfully updated.`,
      });
      router.push("/dashboard/blog-management");
    } catch (error) {
      toast({
        title: "Failed to Update Post",
        description: (error as Error).message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-1/2" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-8 w-1/3 mb-2" />
        <div className="space-y-4 max-w-3xl mx-auto"> {/* Consistent with publish form, but now parent is max-w-5xl */}
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
          <Skeleton className="h-10 w-40" />
        </div>
      </div>
    );
  }

  if (!originalPost && !initialLoading) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Edit3 className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Edit Blog Post</h1>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard/blog-management">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Manage Posts
          </Link>
        </Button>
      </div>
      <p className="text-muted-foreground">
        Modify the details for &quot;{originalPost?.title}&quot;.
      </p>

      <div className="max-w-5xl mx-auto w-full"> {/* Changed max-w-3xl to max-w-5xl */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="post-title" className="text-lg">Post Title <span className="text-destructive">*</span></Label>
            <Input
              id="post-title"
              type="text"
              value={title}
              onChange={handleTitleChange}
              className="mt-1 text-base"
              required
            />
          </div>

          <div>
            <Label htmlFor="post-slug" className="text-lg">Slug <span className="text-destructive">*</span></Label>
            <Input
              id="post-slug"
              type="text"
              value={slug}
              onChange={handleSlugChange}
              className="mt-1 text-base bg-muted/50"
              required
            />
            <p className="text-sm text-muted-foreground mt-1">URL-friendly version of the title. Auto-updated, but can be manually adjusted.</p>
          </div>

          <div>
            <Label htmlFor="post-image-url" className="text-lg flex items-center">
              <ImageIcon className="w-5 h-5 mr-2 text-muted-foreground" /> Cover Image URL
            </Label>
            <Input
              id="post-image-url"
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/your-image.png"
              className="mt-1 text-base"
            />
            <p className="text-sm text-muted-foreground mt-1">Optional: Provide a URL for the post's main image.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="post-category" className="text-lg flex items-center">
                <GripVertical className="w-5 h-5 mr-2 text-muted-foreground" /> Category <span className="text-destructive">*</span>
              </Label>
              <Select value={category} onValueChange={(value) => setCategory(value as BlogCategory)}>
                <SelectTrigger className="mt-1 text-base">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {blogCategories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="post-tags" className="text-lg flex items-center">
                  <TagsIcon className="w-5 h-5 mr-2 text-muted-foreground" /> Tags
              </Label>
              <Input
                id="post-tags"
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g., chess, strategy, fun"
                className="mt-1 text-base"
              />
              <p className="text-sm text-muted-foreground mt-1">Comma-separated list of tags.</p>
            </div>
          </div>

          <div>
            <Label htmlFor="post-content" className="text-lg flex items-center">
              <Type className="w-5 h-5 mr-2 text-muted-foreground" /> Content <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="post-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your blog post content here..."
              className="mt-1 text-base min-h-[300px] resize-y"
              required
            />
             <p className="text-sm text-muted-foreground mt-2">
              Enter your blog post content. Plain text is supported.
            </p>
          </div>

          <Button type="submit" size="lg" className="w-full md:w-auto" disabled={isSubmitting || isLoadingBlogPosts}>
            {isSubmitting || isLoadingBlogPosts ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Save className="mr-2 h-5 w-5" />
            )}
            {isSubmitting || isLoadingBlogPosts ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </div>
    </div>
  );
}
