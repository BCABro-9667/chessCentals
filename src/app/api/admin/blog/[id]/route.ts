// src/app/api/admin/blog/[id]/route.ts
import { NextResponse } from 'next/server';
import { getBlogPostsCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import type { BlogPost, NewBlogPost } from '@/types/blog';

// Get a single blog post by ID (for editing)
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid blog post ID format' }, { status: 400 });
    }

    const postsCollection = await getBlogPostsCollection();
    const postFromDb = await postsCollection.findOne({ _id: new ObjectId(id) });

    if (postFromDb) {
      const { _id, ...rest } = postFromDb;
      const post = { ...rest, id: _id.toHexString() } as BlogPost;
      return NextResponse.json(post);
    } else {
      return NextResponse.json({ message: 'Blog post not found' }, { status: 404 });
    }
  } catch (error) {
    console.error(`Failed to fetch blog post with ID ${params.id}:`, error);
    return NextResponse.json({ message: 'Error fetching blog post', error: (error as Error).message }, { status: 500 });
  }
}

// Update a blog post by ID
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid blog post ID format' }, { status: 400 });
    }

    // Ensure authorEmail is not part of updatable fields from client here
    // Ownership change should be a separate, more secure process if needed.
    const updates = (await request.json()) as Partial<Omit<NewBlogPost, 'authorEmail'>>; 

    if (updates.tags && !Array.isArray(updates.tags)) {
        updates.tags = String(updates.tags).split(',').map(tag => tag.trim()).filter(tag => tag);
    }

    const updateDoc: any = { ...updates, updatedAt: new Date().toISOString() };
    
    // delete updateDoc.authorEmail; // Explicitly ensure authorEmail cannot be changed
    // if ('authorEmail' in updateDoc) delete updateDoc.authorEmail;


    const postsCollection = await getBlogPostsCollection();
    
    if (updates.slug) {
        const existingPostBySlug = await postsCollection.findOne({ slug: updates.slug, _id: { $ne: new ObjectId(id) } });
        if (existingPostBySlug) {
            return NextResponse.json({ message: `A post with slug "${updates.slug}" already exists. Please use a unique slug.` }, { status: 409 });
        }
    }
    
    // Future: Add ownership check here before updating.
    // For now, any user who can access this admin route can update.

    const result = await postsCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateDoc },
      { returnDocument: 'after' }
    );

    if (result) {
      const { _id, ...updatedDoc } = result;
      const updatedPost = { ...updatedDoc, id: _id.toHexString() } as BlogPost;
      return NextResponse.json(updatedPost);
    } else {
      return NextResponse.json({ message: 'Blog post not found for update' }, { status: 404 });
    }
  } catch (error) {
    console.error(`Failed to update blog post ${params.id}:`, error);
    return NextResponse.json({ message: 'Error updating blog post', error: (error as Error).message }, { status: 500 });
  }
}

// Delete a blog post by ID
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid blog post ID format' }, { status: 400 });
    }

    // Future: Add ownership check here before deleting.
    // For now, any user who can access this admin route can delete.
    const postsCollection = await getBlogPostsCollection();
    const result = await postsCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 1) {
      return NextResponse.json({ message: 'Blog post deleted successfully' });
    } else {
      return NextResponse.json({ message: 'Blog post not found for deletion' }, { status: 404 });
    }
  } catch (error) {
    console.error(`Failed to delete blog post ${params.id}:`, error);
    return NextResponse.json({ message: 'Error deleting blog post', error: (error as Error).message }, { status: 500 });
  }
}
