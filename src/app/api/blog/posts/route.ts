// src/app/api/blog/posts/route.ts
import { NextResponse } from 'next/server';
import { getBlogPostsCollection } from '@/lib/mongodb';
import type { NewBlogPost, BlogPost } from '@/types/blog';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const authorEmail = searchParams.get('authorEmail');

    const postsCollection = await getBlogPostsCollection();
    
    const query: any = {};
    if (authorEmail) {
      query.authorEmail = authorEmail;
    }
    
    const postsFromDb = await postsCollection.find(query).sort({ createdAt: -1 }).toArray();
    
    const posts = postsFromDb.map(p => {
      const { _id, ...rest } = p;
      return { ...rest, id: _id.toHexString() } as BlogPost;
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error('Failed to fetch blog posts:', error);
    return NextResponse.json({ message: 'Error fetching blog posts', error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const postData = await request.json() as NewBlogPost & { authorEmail: string };
    
    if (!postData.title || !postData.slug || !postData.content || !postData.category || !postData.authorEmail) {
        return NextResponse.json({ message: 'Missing required blog post data (title, slug, content, category, authorEmail)' }, { status: 400 });
    }

    const tags = Array.isArray(postData.tags) ? postData.tags : (postData.tags ? String(postData.tags).split(',').map(tag => tag.trim()).filter(tag => tag) : []);

    const newPostDocument: Omit<BlogPost, 'id'> = {
      title: postData.title,
      slug: postData.slug,
      imageUrl: postData.imageUrl,
      category: postData.category,
      tags,
      content: postData.content,
      authorEmail: postData.authorEmail, // Save authorEmail
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const postsCollection = await getBlogPostsCollection();
    
    const existingPostBySlug = await postsCollection.findOne({ slug: newPostDocument.slug });
    if (existingPostBySlug) {
        return NextResponse.json({ message: `A post with slug "${newPostDocument.slug}" already exists. Please use a unique slug.` }, { status: 409 });
    }

    const result = await postsCollection.insertOne(newPostDocument as any); 

    if (!result.insertedId) {
        return NextResponse.json({ message: 'Failed to insert blog post into database' }, { status: 500 });
    }
    
    const createdPost: BlogPost = {
        ...newPostDocument,
        id: result.insertedId.toHexString(),
    };

    return NextResponse.json(createdPost, { status: 201 });
  } catch (error) {
    console.error('Failed to create blog post:', error);
    return NextResponse.json({ message: 'Error creating blog post', error: (error as Error).message }, { status: 500 });
  }
}
