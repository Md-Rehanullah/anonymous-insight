import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import CreatePostForm from "@/components/CreatePostForm";
import PostCard from "@/components/PostCard";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useUserInteractions } from "@/hooks/useUserInteractions";
import { supabase } from "@/integrations/supabase/client";

interface Answer {
  id: string;
  content: string;
  likes: number;
  dislikes: number;
  replies: Answer[];
  created_at: string;
}

interface Post {
  id: string;
  title: string;
  description: string;
  category: string;
  likes: number;
  dislikes: number;
  answers: Answer[];
  created_at: string;
  imageUrl?: string;
}


const Homepage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  // Get user interactions for all posts
  const postIds = posts.map(post => post.id);
  const { interactions } = useUserInteractions(postIds);

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
        created_at: post.created_at,
        answers: post.answers.map((answer: any) => ({
          id: answer.id,
          content: answer.content,
          likes: answer.likes,
          dislikes: answer.dislikes,
          replies: [], // For now, we'll keep replies empty
          created_at: answer.created_at
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
        created_at: data.created_at,
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

  // Handle like functionality with authentication check
  const handleLike = async (postId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to like posts.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    try {
      const { error } = await supabase.rpc('increment_post_likes' as any, {
        post_id: postId,
        user_id: user.id
      });

      if (error) throw error;

      // Refresh posts to show updated counts
      await fetchPosts();
      
      toast({
        title: "Post liked!",
        description: "Your interaction has been recorded.",
      });
    } catch (error) {
      console.error('Error liking post:', error);
      toast({
        title: "Error",
        description: "Failed to like post. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle dislike functionality with authentication check
  const handleDislike = async (postId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to dislike posts.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    try {
      const { error } = await supabase.rpc('increment_post_dislikes' as any, {
        post_id: postId,
        user_id: user.id
      });

      if (error) throw error;

      // Refresh posts to show updated counts
      await fetchPosts();
      
      toast({
        title: "Post disliked!",
        description: "Your interaction has been recorded.",
      });
    } catch (error) {
      console.error('Error disliking post:', error);
      toast({
        title: "Error",
        description: "Failed to dislike post. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReport = (postId: string, reason: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to report posts.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }
    
    console.log('Report submitted for post:', postId, 'Reason:', reason);
    toast({
      title: "Report submitted",
      description: "Thank you for helping keep our community safe.",
    });
  };

  const handleAddAnswer = async (postId: string, answerContent: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to add answers.",
        variant: "destructive",
      });
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

      // Refresh posts to show the new answer
      await fetchPosts();
      
      toast({
        title: "Answer posted!",
        description: "Your answer has been added successfully.",
      });
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
                userInteraction={interactions[post.id] || null}
              />
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Homepage;