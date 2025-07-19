"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// Define interfaces for each platform's post structure
interface YouTubeVideo {
  id: string;
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      medium: {
        url: string;
      };
    };
    publishedAt: string;
  };
}

interface FacebookPost {
  id: string;
  message: string;
  full_picture?: string;
  permalink_url: string;
  created_time: string;
}

interface InstagramPost {
  id: string;
  caption?: {
    text: string;
  };
  media_url: string;
  permalink: string;
  timestamp: string;
}

// Unified post interface for the component
interface SocialMediaPost {
  id: string;
  platform: string;
  title: string;
  description: string;
  image_url: string;
  post_url: string;
  created_at: string;
}

export default function SocialMediaFeed() {
  const [activeTab, setActiveTab] = useState("youtube");
  const [posts, setPosts] = useState<SocialMediaPost[]>([]);
  const [visiblePosts, setVisiblePosts] = useState<SocialMediaPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const postsPerPage = 9;

  // API Configuration
  const YOUTUBE_CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID;
  const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;

  const FACEBOOK_PAGE_ID = process.env.FACEBOOK_PAGE_ID;
  const FACEBOOK_ACCESS_TOKEN = process.env.NEXT_PUBLIC_FACEBOOK_ACCESS_TOKEN;

  const INSTAGRAM_USER_ID = process.env.INSTAGRAM_USER_ID;
  const INSTAGRAM_ACCESS_TOKEN = process.env.NEXT_PUBLIC_INSTAGRAM_ACCESS_TOKEN;

  useEffect(() => {
    fetchSocialMediaContent();
  }, []);

  useEffect(() => {
    // Filter posts based on active tab
    const filteredPosts = posts.filter((post) => post.platform === activeTab);
    setVisiblePosts(filteredPosts.slice(0, page * postsPerPage));
  }, [activeTab, posts, page]);

  const fetchSocialMediaContent = async () => {
    setLoading(true);
    try {
      // Fetch from all platforms in parallel
      const [youtubeData, facebookData, instagramData] = await Promise.all([
        fetchYouTubeVideos(),
        fetchFacebookPosts(),
        fetchInstagramPosts(),
      ]);

      // Combine all posts
      const allPosts = [...youtubeData, ...facebookData, ...instagramData];

      // Sort by date (newest first)
      allPosts.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setPosts(allPosts);
      setVisiblePosts(
        allPosts
          .filter((post) => post.platform === activeTab)
          .slice(0, postsPerPage)
      );
    } catch (error) {
      console.error("Error fetching social media content:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchYouTubeVideos = async (): Promise<SocialMediaPost[]> => {
    try {
      // Try the alternative API first
      let response = await fetch('/api/social/youtube-alternative');
      let useAlternative = true;

      // If alternative fails, try the original
      if (!response.ok) {
        console.log('Alternative YouTube API failed, trying original...');
        response = await fetch('/api/social/youtube');
        useAlternative = false;
      }

      if (!response.ok) {
        const errorData = await response.json();
        console.error('YouTube API error:', errorData);
        return [];
      }

      const data = await response.json();

      return data.items?.map((item: any) => {
        // Extract video ID based on API type
        let videoId: string;

        if (useAlternative) {
          // For playlist items API (alternative)
          videoId = item.id; // This should already be the video ID from our transformation
        } else {
          // For search API (original)
          videoId = typeof item.id === 'string' ? item.id : item.id?.videoId;
        }

        console.log('Video ID:', videoId); // Debug log

        return {
          id: videoId,
          platform: "youtube",
          title: item.snippet.title,
          description: item.snippet.description,
          image_url: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
          post_url: `https://www.youtube.com/watch?v=${videoId}`,
          created_at: item.snippet.publishedAt,
        };
      }) || [];
    } catch (error) {
      console.error("YouTube fetch error:", error);
      return [];
    }
  };


  const fetchFacebookPosts = async (): Promise<SocialMediaPost[]> => {
    try {
      const response = await fetch('/api/social/facebook');

      if (!response.ok) {
        throw new Error(`Facebook API error: ${response.status}`);
      }

      const data = await response.json();

      return data.data?.map((item: FacebookPost) => ({
        id: item.id,
        platform: "facebook",
        title: item.message?.split("\n")[0] || "Facebook Post",
        description: item.message || "",
        image_url: item.full_picture || "",
        post_url: item.permalink_url,
        created_at: item.created_time,
      })) || [];
    } catch (error) {
      console.error("Facebook fetch error:", error);
      return [];
    }
  };

  const fetchInstagramPosts = async (): Promise<SocialMediaPost[]> => {
    try {
      const response = await fetch('/api/social/instagram');

      if (!response.ok) {
        throw new Error(`Instagram API error: ${response.status}`);
      }

      const data = await response.json();

      return data.data?.map((item: InstagramPost) => ({
        id: item.id,
        platform: "instagram",
        title: item.caption?.text?.split("\n")[0] || "Instagram Post",
        description: item.caption?.text || "",
        image_url: item.media_url,
        post_url: item.permalink,
        created_at: item.timestamp,
      })) || [];
    } catch (error) {
      console.error("Instagram fetch error:", error);
      return [];
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setPage(1);
  };

  const loadMore = () => {
    setPage((prev) => prev + 1);
  };

  const hasMorePosts = () => {
    const filteredPosts = posts.filter((post) => post.platform === activeTab);
    return visiblePosts.length < filteredPosts.length;
  };

  return (
    <Tabs
      defaultValue="youtube"
      className="mx-auto max-w-3xl"
      onValueChange={handleTabChange}
    >
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="youtube">YouTube</TabsTrigger>
        <TabsTrigger value="facebook">Facebook</TabsTrigger>
        <TabsTrigger value="instagram">Instagram</TabsTrigger>
      </TabsList>

      <TabsContent value="youtube" className="mt-6">
        <Card className="rounded-lg border bg-card p-4 shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 overflow-hidden rounded-full">
              <Image src="/logo.png" alt="BDYFC" width={40} height={40} />
            </div>
            <span className="font-semibold">BDYFC</span>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2">
                {visiblePosts.length > 0 ? (
                  visiblePosts.map((post) => (
                    <Link
                      key={post.id}
                      href={post.post_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <div className="aspect-video overflow-hidden rounded-md bg-muted">
                        <Image
                          src={post.image_url || "/video-thumbnail-1.jpg"}
                          alt={post.title}
                          width={120}
                          height={80}
                          className="h-full w-full object-cover transition-transform duration-300 hover:scale-110"
                        />
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="col-span-3 py-8 text-center text-muted-foreground">
                    No YouTube content available
                  </div>
                )}
              </div>

              {hasMorePosts() && (
                <div className="mt-4 flex gap-2">
                  <Button variant="secondary" size="sm" onClick={loadMore}>
                    Load More...
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                    asChild
                  >
                    <Link
                      href="https://www.youtube.com/@BDYFC"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Subscribe
                    </Link>
                  </Button>
                </div>
              )}
            </>
          )}
        </Card>
      </TabsContent>

      <TabsContent value="facebook" className="mt-6">
        <Card className="rounded-lg border bg-card p-4 shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 overflow-hidden rounded-full">
              <Image src="/logo.png" alt="BDYFC" width={40} height={40} />
            </div>
            <span className="font-semibold">BDYFC</span>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4">
                {visiblePosts.length > 0 ? (
                  visiblePosts.map((post) => (
                    <Link
                      key={post.id}
                      href={post.post_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <div className="overflow-hidden rounded-md border bg-card p-4 hover:bg-muted/50 transition-colors">
                        {post.image_url && (
                          <div className="mb-3 aspect-video overflow-hidden rounded-md">
                            <Image
                              src={post.image_url || "/placeholder.svg"}
                              alt={post.title}
                              width={500}
                              height={300}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        )}
                        <h3 className="font-medium">{post.title}</h3>
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                          {post.description}
                        </p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    No Facebook content available
                  </div>
                )}
              </div>

              {hasMorePosts() && (
                <div className="mt-4 flex gap-2">
                  <Button variant="secondary" size="sm" onClick={loadMore}>
                    Load More...
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                    asChild
                  >
                    <Link
                      href="https://www.facebook.com/DYFCbombayCNI/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Follow
                    </Link>
                  </Button>
                </div>
              )}
            </>
          )}
        </Card>
      </TabsContent>

      <TabsContent value="instagram" className="mt-6">
        <Card className="rounded-lg border bg-card p-4 shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 overflow-hidden rounded-full">
              <Image src="/logo.png" alt="BDYFC" width={40} height={40} />
            </div>
            <span className="font-semibold">BDYFC</span>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2">
                {visiblePosts.length > 0 ? (
                  visiblePosts.map((post) => (
                    <Link
                      key={post.id}
                      href={post.post_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <div className="aspect-square overflow-hidden rounded-md bg-muted">
                        <Image
                          src={post.image_url || "/placeholder.svg"}
                          alt={post.title}
                          width={120}
                          height={120}
                          className="h-full w-full object-cover transition-transform duration-300 hover:scale-110"
                        />
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="col-span-3 py-8 text-center text-muted-foreground">
                    No Instagram content available
                  </div>
                )}
              </div>

              {hasMorePosts() && (
                <div className="mt-4 flex gap-2">
                  <Button variant="secondary" size="sm" onClick={loadMore}>
                    Load More...
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                    asChild
                  >
                    <Link
                      href="https://www.instagram.com/bdyfc_cni/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Follow
                    </Link>
                  </Button>
                </div>
              )}
            </>
          )}
        </Card>
      </TabsContent>
    </Tabs>
  );
}
