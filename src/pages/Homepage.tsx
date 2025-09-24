import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import CreatePostForm from "@/components/CreatePostForm";
import PostCard from "@/components/PostCard";
import { useToast } from "@/hooks/use-toast";

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

// Mock data for demonstration - in production, this would come from MongoDB
const generateMockPosts = (): Post[] => [
  {
    id: "1",
    title: "What are the best practices for learning React?",
    description: "I'm new to React and wondering what the most effective ways to learn it are. Should I start with class components or hooks?",
    category: "Technology",
    likes: 15,
    dislikes: 2,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    answers: [
      {
        id: "a1",
        content: "Start with functional components and hooks! They're the modern way and much easier to understand.",
        likes: 8,
        dislikes: 0,
        replies: [],
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000)
      },
      {
        id: "a2", 
        content: "Build projects! Theory is good but hands-on experience is what really makes things click.",
        likes: 12,
        dislikes: 1,
        replies: [],
        timestamp: new Date(Date.now() - 30 * 60 * 1000)
      }
    ]
  },
  {
    id: "2",
    title: "Climate Change: What can individuals do?",
    description: "With all the news about climate change, I feel overwhelmed. What are some practical steps individuals can take to make a real difference?",
    category: "Science",
    likes: 23,
    dislikes: 3,
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    answers: [
      {
        id: "a3",
        content: "Reduce, reuse, recycle! Also consider your transportation choices - walking, biking, or public transport when possible.",
        likes: 18,
        dislikes: 2,
        replies: [],
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000)
      }
    ]
  },
  {
    id: "3",
    title: "Best strategies for studying effectively?",
    description: "I'm struggling with my study habits. What techniques have worked best for you when trying to retain information long-term?",
    category: "Education", 
    likes: 31,
    dislikes: 1,
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    answers: [
      {
        id: "a4",
        content: "Spaced repetition is incredibly effective! Also, try to teach someone else what you've learned - it really helps solidify the knowledge.",
        likes: 22,
        dislikes: 0,
        replies: [],
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000)
      },
      {
        id: "a5",
        content: "Active recall instead of passive reading. Quiz yourself regularly and use flashcards for key concepts.",
        likes: 15,
        dislikes: 1,
        replies: [],
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000)
      },
      {
        id: "a6",
        content: "Find your peak focus hours and protect them! Also, remove distractions - put your phone in another room.",
        likes: 19,
        dislikes: 0,
        replies: [],
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000)
      },
      {
        id: "a7",
        content: "Pomodoro technique works wonders for me - 25 min focused work, 5 min break.",
        likes: 11,
        dislikes: 2,
        replies: [],
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        id: "a8",
        content: "Mix up your study locations and methods. Don't just read - write summaries, draw diagrams, discuss with others.",
        likes: 16,
        dislikes: 1,
        replies: [],
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000)
      }
    ]
  }
];

const Homepage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // In production, this would fetch from MongoDB API
    setPosts(generateMockPosts());
  }, []);

  const handleCreatePost = (newPostData: {
    title: string;
    description: string;
    category: string;
    imageUrl?: string;
  }) => {
    const newPost: Post = {
      id: Date.now().toString(),
      ...newPostData,
      likes: 0,
      dislikes: 0,
      answers: [],
      timestamp: new Date(),
    };

    setPosts(prevPosts => [newPost, ...prevPosts]);
    
    // In production, this would send to MongoDB API
    console.log("Creating post:", newPost);
  };

  const handleLike = (postId: string) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId ? { ...post, likes: post.likes + 1 } : post
      )
    );
    // In production, this would update MongoDB
  };

  const handleDislike = (postId: string) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId ? { ...post, dislikes: post.dislikes + 1 } : post
      )
    );
    // In production, this would update MongoDB
  };

  const handleReport = (postId: string, reason: string) => {
    // In production, this would send report to your email
    console.log(`Report for post ${postId}: ${reason}`);
    
    // Here you would integrate with an email service to send the report
    // For now, we'll just show a toast
  };

  const handleAddAnswer = (postId: string, answerContent: string) => {
    const newAnswer: Answer = {
      id: Date.now().toString(),
      content: answerContent,
      likes: 0,
      dislikes: 0,
      replies: [],
      timestamp: new Date(),
    };

    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? { ...post, answers: [...post.answers, newAnswer] }
          : post
      )
    );
    // In production, this would update MongoDB
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