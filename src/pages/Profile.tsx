import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import PostCard from "@/components/PostCard";
import PostCardSkeleton from "@/components/PostCardSkeleton";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useUserInteractions } from "@/hooks/useUserInteractions";
import { supabase } from "@/integrations/supabase/client";
import { User, FileText, MessageCircle, ThumbsUp, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

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

interface UserAnswer {
  id: string;
  content: string;
  likes: number;
  dislikes: number;
  created_at: string;
  post: {
    id: string;
    title: string;
  };
}

const Profile = () => {
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalAnswers: 0,
    totalLikesReceived: 0,
  });
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const postIds = userPosts.map(post => post.id);
  const { interactions } = useUserInteractions(postIds);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Fetch user's posts
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          *,
          answers (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      const transformedPosts: Post[] = (postsData || []).map((post: any) => ({
        id: post.id,
        title: post.title,
        description: post.description,
        category: post.category,
        likes: post.likes,
        dislikes: post.dislikes,
        imageUrl: post.image_url,
        created_at: post.created_at,
        answers: (post.answers || []).map((answer: any) => ({
          id: answer.id,
          content: answer.content,
          likes: answer.likes,
          dislikes: answer.dislikes,
          replies: [],
          created_at: answer.created_at
        }))
      }));

      setUserPosts(transformedPosts);

      // Fetch user's answers with post info
      const { data: answersData, error: answersError } = await supabase
        .from('answers')
        .select(`
          id,
          content,
          likes,
          dislikes,
          created_at,
          post_id,
          posts!answers_post_id_fkey (
            id,
            title
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (answersError) throw answersError;

      const transformedAnswers: UserAnswer[] = (answersData || []).map((answer: any) => ({
        id: answer.id,
        content: answer.content,
        likes: answer.likes,
        dislikes: answer.dislikes,
        created_at: answer.created_at,
        post: {
          id: answer.posts?.id || answer.post_id,
          title: answer.posts?.title || 'Unknown Post'
        }
      }));

      setUserAnswers(transformedAnswers);

      // Calculate stats
      const totalLikesReceived = transformedPosts.reduce((acc, post) => acc + post.likes, 0) +
        transformedAnswers.reduce((acc, answer) => acc + answer.likes, 0);

      setStats({
        totalPosts: transformedPosts.length,
        totalAnswers: transformedAnswers.length,
        totalLikesReceived,
      });

    } catch (error) {
      console.error('Error fetching user data:', error);
      toast({
        title: "Error",
        description: "Failed to load your profile data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase.rpc('increment_post_likes' as any, {
        post_id: postId,
        user_id: user.id
      });

      if (error) throw error;
      await fetchUserData();
    } catch (error) {
      console.error('Error liking post:', error);
      toast({
        title: "Error",
        description: "Failed to like post.",
        variant: "destructive",
      });
    }
  };

  const handleDislike = async (postId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase.rpc('increment_post_dislikes' as any, {
        post_id: postId,
        user_id: user.id
      });

      if (error) throw error;
      await fetchUserData();
    } catch (error) {
      console.error('Error disliking post:', error);
      toast({
        title: "Error",
        description: "Failed to dislike post.",
        variant: "destructive",
      });
    }
  };

  const handleReport = (postId: string, reason: string) => {
    toast({
      title: "Report submitted",
      description: "Thank you for helping keep our community safe.",
    });
  };

  const handleAddAnswer = async (postId: string, answerContent: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('answers')
        .insert({
          post_id: postId,
          user_id: user.id,
          content: answerContent
        });

      if (error) throw error;
      await fetchUserData();
      
      toast({
        title: "Answer posted!",
        description: "Your answer has been added successfully.",
      });
    } catch (error) {
      console.error('Error adding answer:', error);
      toast({
        title: "Error",
        description: "Failed to add answer.",
        variant: "destructive",
      });
    }
  };

  const handleAnswerLike = async (answerId: string) => {
    try {
      const { error } = await supabase.rpc('increment_answer_likes', {
        answer_id: answerId
      });

      if (error) throw error;
      await fetchUserData();
    } catch (error) {
      console.error('Error liking answer:', error);
    }
  };

  const handleAnswerDislike = async (answerId: string) => {
    try {
      const { error } = await supabase.rpc('increment_answer_dislikes', {
        answer_id: answerId
      });

      if (error) throw error;
      await fetchUserData();
    } catch (error) {
      console.error('Error disliking answer:', error);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <PostCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Profile Header */}
        <Card className="p-6 mb-8 shadow-card">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <Avatar className="h-20 w-20 border-4 border-primary/20">
              <AvatarFallback className="bg-gradient-primary text-white text-2xl">
                <User className="h-10 w-10" />
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-bold mb-2">My Profile</h1>
              <p className="text-muted-foreground mb-4">
                View and manage your posts and activity
              </p>
              
              <div className="flex flex-wrap justify-center sm:justify-start gap-4">
                <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1">
                  <FileText className="h-3 w-3" />
                  {stats.totalPosts} Posts
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1">
                  <MessageCircle className="h-3 w-3" />
                  {stats.totalAnswers} Answers
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1">
                  <ThumbsUp className="h-3 w-3" />
                  {stats.totalLikesReceived} Likes Received
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Content Tabs */}
        <Tabs defaultValue="posts" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="posts">My Posts</TabsTrigger>
            <TabsTrigger value="answers">My Answers</TabsTrigger>
          </TabsList>

          <TabsContent value="posts">
            <div className="space-y-6">
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <PostCardSkeleton key={i} />
                ))
              ) : userPosts.length === 0 ? (
                <Card className="p-8 text-center">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    You haven't created any posts yet.
                  </p>
                </Card>
              ) : (
                userPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onLike={handleLike}
                    onDislike={handleDislike}
                    onReport={handleReport}
                    onAddAnswer={handleAddAnswer}
                    onAnswerLike={handleAnswerLike}
                    onAnswerDislike={handleAnswerDislike}
                    userInteraction={interactions[post.id] || null}
                  />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="answers">
            <div className="space-y-4">
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <PostCardSkeleton key={i} />
                ))
              ) : userAnswers.length === 0 ? (
                <Card className="p-8 text-center">
                  <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    You haven't answered any posts yet.
                  </p>
                </Card>
              ) : (
                userAnswers.map((answer) => (
                  <Card key={answer.id} className="p-4 shadow-card">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <p className="text-sm text-muted-foreground">
                          Answered on: <span className="font-medium text-foreground">{answer.post.title}</span>
                        </p>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDistanceToNow(new Date(answer.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm">{answer.content}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="h-3 w-3" />
                          {answer.likes} likes
                        </span>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Profile;
