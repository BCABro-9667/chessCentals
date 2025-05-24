// src/app/dashboard/publish-news/page.tsx
"use client";

import { useState, useCallback }from "react";
import { Newspaper, Send, Loader2, ImageIcon, TagsIcon, Type, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { blogCategories, type BlogCategory, type NewBlogPost } from "@/types/blog";
import { useBlogPosts } from "@/hooks/useBlogPosts";
import { useRouter } from "next/navigation";
import { useAuthMock } from "@/hooks/useAuthMock"; // Import useAuthMock

const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') 
    .replace(/\s+/g, '-')    
    .replace(/-+/g, '-');   
};

export default function PublishNewsPage() {
  const router = useRouter();
  const { addBlogPost, isLoadingBlogPosts } = useBlogPosts();
  const { toast } = useToast();
  const { currentUserEmail } = useAuthMock(); // Get current user's email
  
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [category, setCategory] = useState<BlogCategory | "">("");
  const [tags, setTags] = useState(""); 
  const [content, setContent] = useState("");
  
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    setSlug(generateSlug(newTitle));
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlug(generateSlug(e.target.value)); 
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!currentUserEmail) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to publish a post.",
        variant: "destructive",
      });
      router.push('/login');
      return;
    }

    if (!title.trim() || !slug.trim() || !category || !content.trim()) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in Title, Slug, Category, and Content.",
        variant: "destructive",
      });
      return;
    }

    const postData: NewBlogPost & { authorEmail: string } = {
      title,
      slug,
      imageUrl: imageUrl.trim() || undefined,
      category: category as BlogCategory, 
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      content,
      authorEmail: currentUserEmail, // Add authorEmail
    };

    try {
      const newPost = await addBlogPost(postData);
      toast({
        title: "Blog Post Published!",
        description: `"${newPost.title}" has been successfully published.`,
      });
      setTitle("");
      setSlug("");
      setImageUrl("");
      setCategory("");
      setTags("");
      setContent(""); 
      router.push("/dashboard/blog-management"); // Redirect to blog management page
    } catch (error) {
       toast({
        title: "Failed to Publish Post",
        description: (error as Error).message || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8" >
      <div className="flex items-center gap-3">
        <Newspaper className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold text-foreground">Create Blog Post</h1>
      </div>
      <p className="text-muted-foreground">
        Share your thoughts, news, and analysis with the chess community.
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
              placeholder="Enter a catchy title"
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
              placeholder="e.g., my-awesome-post"
              className="mt-1 text-base bg-muted/50"
              required
            />
            <p className="text-sm text-muted-foreground mt-1">URL-friendly version of the title. Auto-generated, but can be manually adjusted.</p>
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

          <Button type="submit" size="lg" className="w-full md:w-auto" disabled={isLoadingBlogPosts}>
            {isLoadingBlogPosts ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Send className="mr-2 h-5 w-5" />
            )}
            {isLoadingBlogPosts ? "Publishing..." : "Publish Post"}
          </Button>
        </form>
      </div>
    </div>
  );
}
