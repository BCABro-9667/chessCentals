
// src/app/page.tsx
"use client";


import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { CheckCircle, Crown, Users, Zap, CalendarDays, ListChecks, BarChart3, Newspaper, Settings, ShieldCheck, LogIn, FilePlus2, Edit3, ClipboardList } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useTournaments } from '@/hooks/useTournaments';
import TournamentCard from '@/components/cards/TournamentCard';
import { Skeleton } from '@/components/ui/skeleton';
import { useBlogPosts } from '@/hooks/useBlogPosts'; // Added for blog posts
import type { BlogPost } from '@/types/blog'; // Added for blog posts
import { format } from 'date-fns'; // For blog post card
import { Badge } from '@/components/ui/badge'; // For blog post card
import { TagsIcon, CornerDownRight } from 'lucide-react'; // For blog post card

// Re-using BlogPostCard from blog page for consistency
// If a different card style is needed for homepage, this could be a new component.
function BlogPostCardHome({ post }: { post: BlogPost }) {
  const excerpt = post.content.replace(/<[^>]+>/g, '').substring(0, 120) + '...'; // Basic excerpt

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
              {post.tags.slice(0, 2).map(tag => (
                <Badge key={tag} variant="outline" className="text-xs px-1.5 py-0.5">{tag}</Badge>
              ))}
               {post.tags.length > 2 && <span className="text-xs text-muted-foreground">+{post.tags.length-2}</span>}
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


const ServiceItem = ({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) => (
  <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 bg-card/50 dark:bg-card/80 h-full">
    <CardHeader className="items-center text-center">
      <div className="flex items-center justify-center w-16 h-16 bg-primary text-primary-foreground rounded-full mb-4">
        <Icon className="w-8 h-8" />
      </div>
      <CardTitle className="text-xl">{title}</CardTitle>
    </CardHeader>
    <CardContent className="text-center">
      <CardDescription>{description}</CardDescription>
    </CardContent>
  </Card>
);

const WorkflowStep = ({ icon: Icon, step, title, description }: { icon: React.ElementType, step: number, title: string, description: string }) => (
 <div className="flex flex-col items-center text-center">
    <div className="relative mb-4">
      <div className="flex items-center justify-center w-20 h-20 bg-secondary text-secondary-foreground rounded-full mb-2 border-4 border-primary/20 dark:border-primary/40">
        <Icon className="w-10 h-10" />
      </div>
      <div className="absolute -top-2 -right-2 flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-bold">
        {step}
      </div>
    </div>
    <h3 className="text-lg font-semibold mb-1 text-foreground">{title}</h3>
    <p className="text-sm text-muted-foreground">{description}</p>
  </div>
);


export default function HomePage() {
  const { tournaments, isLoadingTournaments } = useTournaments();
  const { blogPosts, isLoadingBlogPosts } = useBlogPosts();

  const upcomingOrActiveTournaments = tournaments
    .filter(t => t.status === 'Upcoming' || t.status === 'Active')
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 3);
  
  const displayTournaments = upcomingOrActiveTournaments.length > 0 
    ? upcomingOrActiveTournaments 
    : tournaments.sort((a,b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()).slice(0,3);

  const latestBlogPosts = blogPosts
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  return (
    <>
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-20 md:py-28 bg-gradient-to-br from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20">
          <div className="container mx-auto px-4 text-center">
            <Crown className="w-20 h-20 md:w-24 md:h-24 text-primary mx-auto mb-6" />
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-foreground">
              Welcome to Chessmate Central
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-3xl mx-auto">
              Your all-in-one platform for organizing, managing, and participating in chess tournaments with unparalleled ease and sophistication.
            </p>
            <div className="space-y-4 sm:space-y-0 sm:space-x-4">
              <Button size="lg" asChild className="w-full sm:w-auto text-lg px-8 py-3">
                <Link href="/tournaments">Explore Tournaments</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="w-full sm:w-auto text-lg px-8 py-3">
                <Link href="/login">Organizer Portal</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Latest Tournaments Section */}
        {(isLoadingTournaments || displayTournaments.length > 0) && (
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">
              Latest Tournaments
            </h2>
            {isLoadingTournaments ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1,2,3].map(i => <Skeleton key={`tourn-skeleton-${i}`} className="h-[450px] w-full rounded-lg"/>)}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {displayTournaments.map(tournament => (
                  <TournamentCard key={tournament.id} tournament={tournament} />
                ))}
              </div>
            )}
            {tournaments.length > 0 && (
              <div className="text-center mt-12">
                <Button size="lg" asChild variant="secondary">
                  <Link href="/tournaments">View All Tournaments</Link>
                </Button>
              </div>
            )}
          </div>
        </section>
        )}

        {/* Latest Blog Posts Section */}
        {(isLoadingBlogPosts || latestBlogPosts.length > 0) && (
          <section className="py-16 bg-secondary/10 dark:bg-secondary/5">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">
                Latest From Our Blog
              </h2>
              {isLoadingBlogPosts ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[1,2,3].map(i => <Skeleton key={`blog-skeleton-${i}`} className="h-[450px] w-full rounded-lg"/>)}
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {latestBlogPosts.map((post) => (
                    <BlogPostCardHome key={post.id} post={post} />
                  ))}
                </div>
              )}
              {blogPosts.length > 0 && (
                <div className="text-center mt-12">
                  <Button size="lg" asChild variant="secondary">
                    <Link href="/blog">View All Posts</Link>
                  </Button>
                </div>
              )}
            </div>
          </section>
        )}


        {/* Our Services Section */}
        <section className="py-16 bg-secondary/30 dark:bg-secondary/20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">
              What We Offer
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              <ServiceItem 
                icon={FilePlus2} 
                title="Tournament Creation" 
                description="Easily set up various tournament types (Swiss, Round Robin, etc.) with detailed configurations." 
              />
              <ServiceItem 
                icon={Zap} 
                title="AI-Powered Content" 
                description="Generate captivating tournament descriptions and news articles instantly with our intelligent AI assistant." 
              />
              <ServiceItem 
                icon={Users} 
                title="Player Registration" 
                description="Streamlined public and organizer-managed player registration with customizable fields." 
              />
              <ServiceItem 
                icon={ListChecks} 
                title="Standings & Results" 
                description="Manage live scores, and automatically calculate and display tournament standings for participants." 
              />
              <ServiceItem 
                icon={CalendarDays} 
                title="Public Tournament Pages" 
                description="Beautifully designed public pages to showcase tournament details, registered players, and results." 
              />
              <ServiceItem 
                icon={Newspaper} 
                title="News Publishing" 
                description="Share updates, articles, and chess news with the community using a rich text editor." 
              />
            </div>
          </div>
        </section>
        
        {/* How It Works Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-foreground">
              Get Started in 5 Easy Steps
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
              <WorkflowStep 
                icon={ShieldCheck} 
                step={1} 
                title="Login/Register" 
                description="Create an organizer account or log in to access your dashboard." 
              />
              <WorkflowStep 
                icon={FilePlus2} 
                step={2} 
                title="Create Tournament" 
                description="Fill in tournament details, set dates, fees, and use AI for a great description." 
              />
              <WorkflowStep 
                icon={Users} 
                step={3} 
                title="Manage Players" 
                description="Register players manually or allow public registration. Keep track of participants." 
              />
              <WorkflowStep 
                icon={ClipboardList} 
                step={4} 
                title="Update Results" 
                description="Enter scores for each round as the tournament progresses. Standings update automatically." 
              />
              <WorkflowStep 
                icon={Newspaper} 
                step={5} 
                title="Publish News" 
                description="Share tournament highlights, announcements, or chess articles with the community." 
              />
            </div>
          </div>
        </section>

        {/* Image section - retained for visual break */}
        <section className="py-16 bg-secondary/50 dark:bg-secondary/30">
            <div className="container mx-auto px-4 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-foreground">Magnus Carlsen</h2>
                <div className="max-w-4xl mx-auto rounded-lg shadow-2xl overflow-hidden">
                 <Image src="/meggi.png" alt="MegnusCarlsen Image" width={1000} height={345}/>

                </div>
            </div>
        </section>

        {/* Footer */}
        <footer className="py-8 bg-card border-t border-border">
          <div className="container mx-auto px-4 text-center text-muted-foreground">
            &copy; {new Date().getFullYear()} Chessmate Central. All rights reserved.
          </div>
        </footer>
      </main>
    </>
  );
}


    
