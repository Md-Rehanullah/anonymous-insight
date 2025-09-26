import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import CreatePostForm from "@/components/CreatePostForm";
import PostCard from "@/components/PostCard";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface Answer {
  id: string;
  content: string;
  likes: number;
  dislikes: number;
  replies: Answer[];
  timestamp: Date;
}

interface Post {
  id: string;
  title: string;
  description: string;
  category: string;
  likes: number;
  dislikes: number;
  answers: Answer[];
  timestamp: Date;
  imageUrl?: string;
}


const Homepage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          answers (
            *
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching posts:', error);
        toast({
          title: "Error",
          description: "Failed to load posts. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Transform data to match the expected Post interface
      const transformedPosts: Post[] = data.map((post: any) => ({
        id: post.id,
        title: post.title,
        description: post.description,
        category: post.category,
        likes: post.likes,
        dislikes: post.dislikes,
        imageUrl: post.image_url,
        timestamp: new Date(post.created_at),
        answers: post.answers.map((answer: any) => ({
          id: answer.id,
          content: answer.content,
          likes: answer.likes,
          dislikes: answer.dislikes,
          replies: [], // For now, we'll keep replies empty
          timestamp: new Date(answer.created_at)
        }))
      }));

      setPosts(transformedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error",
        description: "Failed to load posts. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCreatePost = async (newPostData: {
    title: string;
    description: string;
    category: string;
    imageUrl?: string;
  }) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          title: newPostData.title,
          description: newPostData.description,
          category: newPostData.category,
          image_url: newPostData.imageUrl
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating post:', error);
        toast({
          title: "Error",
          description: "Failed to create post. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Add the new post to the local state
      const newPost: Post = {
        id: data.id,
        title: data.title,
        description: data.description,
        category: data.category,
        likes: data.likes,
        dislikes: data.dislikes,
        imageUrl: data.image_url,
        timestamp: new Date(data.created_at),
        answers: []
      };

      setPosts(prevPosts => [newPost, ...prevPosts]);
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const { error } = await supabase.rpc('increment_post_likes', {
        post_id: postId
      });

      if (error) {
        console.error('Error liking post:', error);
        return;
      }

      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId ? { ...post, likes: post.likes + 1 } : post
        )
      );
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleDislike = async (postId: string) => {
    try {
      const { error } = await supabase.rpc('increment_post_dislikes', {
        post_id: postId
      });

      if (error) {
        console.error('Error disliking post:', error);
        return;
      }

      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId ? { ...post, dislikes: post.dislikes + 1 } : post
        )
      );
    } catch (error) {
      console.error('Error disliking post:', error);
    }
  };

  const handleReport = (postId: string, reason: string) => {
    // In production, this would send report to your email
    console.log(`Report for post ${postId}: ${reason}`);
    
    // Here you would integrate with an email service to send the report
    // For now, we'll just show a toast
  };

  const handleAddAnswer = async (postId: string, answerContent: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('answers')
        .insert({
          post_id: postId,
          user_id: user.id,
          content: answerContent
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding answer:', error);
        toast({
          title: "Error",
          description: "Failed to add answer. Please try again.",
          variant: "destructive",
        });
        return;
      }

      const newAnswer: Answer = {
        id: data.id,
        content: data.content,
        likes: data.likes,
        dislikes: data.dislikes,
        replies: [],
        timestamp: new Date(data.created_at),
      };

      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? { ...post, answers: [...post.answers, newAnswer] }
            : post
        )
      );
    } catch (error) {
      console.error('Error adding answer:', error);
      toast({
        title: "Error",
        description: "Failed to add answer. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="bg-gradient-hero text-white rounded-2xl p-8 shadow-glow">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Ask Anything, Share Everything
            </h1>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">
              A place where curiosity meets knowledge. Ask questions, share insights, 
              and connect with others - all completely anonymous.
            </p>
          </div>
        </div>

        {/* Create Post Form */}
        <CreatePostForm onCreatePost={handleCreatePost} />

        {/* Posts Feed */}
        <div className="space-y-6">
          {posts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg">No posts yet. Be the first to ask a question!</p>
            </div>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onLike={handleLike}
                onDislike={handleDislike}
                onReport={handleReport}
                onAddAnswer={handleAddAnswer}
              />
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Homepage;