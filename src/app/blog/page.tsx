// src/app/blog/page.tsx
"use client";

import { useEffect } from 'react'; // Added useEffect
import Header from '@/components/layout/Header';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import type { BlogPost } from '@/types/blog';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import Image from 'next/image';
import { Newspaper, CalendarDays, TagsIcon, CornerDownRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

function BlogPostCard({ post }: { post: BlogPost }) {
  const excerpt = post.content.replace(/<[^>]+>/g, '').substring(0, 150) + '...'; // Basic excerpt

  return (
    <Card className="flex flex-col h-full shadow-lg hover:shadow-xl transition-shadow duration-300">
      {post.imageUrl && (
        <div className="relative w-full h-48 sm:h-56">
          <Image
            src={post.imageUrl}
            alt={post.title}
            fill
            style={{objectFit:"cover"}}
            className="rounded-t-lg bg-muted"
            data-ai-hint="article header"
             onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.srcset = `https://placehold.co/600x400.png`; 
                  target.src = `https://placehold.co/600x400.png`; 
                }}
          />
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-xl md:text-2xl hover:text-primary transition-colors">
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground flex items-center gap-2">
          <CalendarDays className="w-3.5 h-3.5" /> {format(new Date(post.createdAt), 'MMMM dd, yyyy')}
          <Badge variant="secondary" className="ml-auto">{post.category}</Badge>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-foreground/80 leading-relaxed">{excerpt}</p>
      </CardContent>
      <CardFooter className="mt-auto border-t pt-4">
        <div className="flex justify-between items-center w-full">
           {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 items-center text-xs">
              <TagsIcon className="w-3.5 h-3.5 text-muted-foreground" />
              {post.tags.slice(0, 3).map(tag => (
                <Badge key={tag} variant="outline" className="text-xs px-1.5 py-0.5">{tag}</Badge>
              ))}
            </div>
          )}
          <Button asChild variant="link" size="sm" className="ml-auto text-primary hover:text-primary/80 px-0">
            <Link href={`/blog/${post.slug}`}>Read More <CornerDownRight className="w-3.5 h-3.5 ml-1" /></Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}


export default function BlogListPage() {
  const { blogPosts, isLoadingBlogPosts, errorBlogPosts, fetchBlogPosts } = useBlogPosts();

  useEffect(() => {
    fetchBlogPosts(); // Fetch all blog posts for public display
  }, [fetchBlogPosts]);

  return (
    <>
      <Header />
      <main className="flex-grow bg-gradient-to-br from-primary/5 to-accent/5 dark:from-primary/10 dark:to-accent/10 py-10">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <Newspaper className="w-16 h-16 text-primary mx-auto mb-4" />
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-3">
              Chessmate Central Blog
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Latest news, insights, and updates from the world of chess.
            </p>
          </div>

          {isLoadingBlogPosts && blogPosts.length === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="flex flex-col h-full">
                  <Skeleton className="w-full h-48 sm:h-56 rounded-t-lg" />
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent className="flex-grow space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                  <CardFooter className="mt-auto border-t pt-4">
                     <Skeleton className="h-8 w-24" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}

          {!isLoadingBlogPosts && errorBlogPosts && (
             <div className="text-center py-16 text-destructive">
                <Newspaper className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-2xl mb-6">Error loading blog posts.</p>
                <p className="text-muted-foreground">{errorBlogPosts}</p>
             </div>
          )}
          
          {!isLoadingBlogPosts && !errorBlogPosts && blogPosts.length === 0 && (
            <div className="text-center py-16">
              <Newspaper className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-2xl text-muted-foreground mb-6">No blog posts found yet.</p>
              <Button asChild size="lg">
                <Link href="/dashboard/publish-news">Organizers: Write the first post!</Link>
              </Button>
            </div>
          )}

          {!isLoadingBlogPosts && !errorBlogPosts && blogPosts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {blogPosts.map((post) => (
                <BlogPostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </main>
      <footer className="py-8 bg-card border-t border-border mt-auto">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          &copy; {new Date().getFullYear()} Chessmate Central. All rights reserved.
        </div>
      </footer>
    </>
  );
}
