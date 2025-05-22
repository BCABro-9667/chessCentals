// src/app/dashboard/blog-management/page.tsx
"use client";

import { useEffect } from 'react';
import Link from 'next/link';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, PlusCircle, Loader2, Newspaper, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';

export default function BlogManagementPage() {
  const { blogPosts, isLoadingBlogPosts, errorBlogPosts, deleteBlogPost, fetchBlogPosts } = useBlogPosts();
  const { toast } = useToast();

  useEffect(() => {
    fetchBlogPosts(); // Fetch posts when component mounts
  }, [fetchBlogPosts]);

  const handleDeletePost = async (postId: string, postTitle: string) => {
    try {
      await deleteBlogPost(postId);
      toast({
        title: "Blog Post Deleted",
        description: `"${postTitle}" has been successfully deleted.`,
      });
    } catch (error) {
      toast({
        title: "Error Deleting Post",
        description: (error as Error).message || "Could not delete the post.",
        variant: "destructive",
      });
    }
  };

  if (isLoadingBlogPosts && blogPosts.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-40" />
        </div>
        <Card>
          <CardHeader><Skeleton className="h-8 w-1/3" /></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (errorBlogPosts) {
    return (
      <div className="text-center py-10">
        <Newspaper className="w-16 h-16 mx-auto text-destructive mb-4" />
        <h2 className="text-2xl font-semibold text-destructive mb-2">Error Loading Blog Posts</h2>
        <p className="text-muted-foreground mb-4">{errorBlogPosts}</p>
        <Button onClick={fetchBlogPosts}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-foreground flex items-center">
          <FileText className="w-8 h-8 mr-3 text-primary" />
          Manage Blog Posts
        </h1>
        <Button asChild size="lg">
          <Link href="/dashboard/publish-news">
            <PlusCircle className="mr-2 h-5 w-5" /> Create New Post
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Blog Posts ({blogPosts.length})</CardTitle>
          <CardDescription>View, edit, or delete existing blog posts.</CardDescription>
        </CardHeader>
        <CardContent>
          {blogPosts.length === 0 ? (
            <div className="text-center py-10">
              <Newspaper className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-xl text-muted-foreground">No blog posts found.</p>
              <p className="text-sm text-muted-foreground">
                <Link href="/dashboard/publish-news" className="text-primary hover:underline">
                  Create your first post
                </Link> 
                to get started.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {blogPosts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell className="font-medium max-w-xs truncate">
                        <Link href={`/blog/${post.slug}`} target="_blank" className="hover:underline" title={post.title}>
                          {post.title}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{post.category}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {post.tags.slice(0, 3).map(tag => (
                          <Badge key={tag} variant="outline" className="mr-1 mb-1 text-xs">{tag}</Badge>
                        ))}
                        {post.tags.length > 3 && <span className="text-xs text-muted-foreground">+{post.tags.length - 3} more</span>}
                      </TableCell>
                      <TableCell>{format(new Date(post.createdAt), 'PPp')}</TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="icon" asChild title="Edit Post">
                          <Link href={`/dashboard/blog-management/${post.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" title="Delete Post" className="text-destructive hover:text-destructive/80">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the blog post titled &quot;{post.title}&quot;.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeletePost(post.id, post.title)}
                                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                                disabled={isLoadingBlogPosts}
                              >
                                {isLoadingBlogPosts && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
