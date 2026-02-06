import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThumbsUp, ThumbsDown, Share2, Flag, MessageCircle, ChevronDown, ChevronUp, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface Answer {
  id: string;
  content: string;
  likes: number;
  dislikes: number;
  replies: Answer[];
  created_at: string;
  authorName?: string;
  authorAvatar?: string;
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
  authorName?: string;
  authorAvatar?: string;
}

interface PostCardProps {
  post: Post;
  onLike: (postId: string) => void;
  onDislike: (postId: string) => void;
  onReport: (postId: string, reason: string) => void;
  onAddAnswer: (postId: string, answer: string) => void;
  onAnswerLike?: (answerId: string) => void;
  onAnswerDislike?: (answerId: string) => void;
  userInteraction?: 'like' | 'dislike' | null;
}

const PostCard = ({ post, onLike, onDislike, onReport, onAddAnswer, onAnswerLike, onAnswerDislike, userInteraction }: PostCardProps) => {
  const [showAllAnswers, setShowAllAnswers] = useState(false);
  const [newAnswer, setNewAnswer] = useState("");
  const [showAnswerForm, setShowAnswerForm] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [showReportForm, setShowReportForm] = useState(false);
  const { toast } = useToast();

  const displayedAnswers = showAllAnswers ? post.answers : post.answers.slice(0, 4);
  const hasMoreAnswers = post.answers.length > 4;

  const handleShare = async () => {
    try {
      await navigator.share({
        title: post.title,
        text: post.description,
        url: window.location.href
      });
    } catch {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "The post link has been copied to your clipboard.",
      });
    }
  };

  const handleReport = () => {
    if (reportReason.trim()) {
      onReport(post.id, reportReason);
      setReportReason("");
      setShowReportForm(false);
      toast({
        title: "Report submitted",
        description: "Thank you for helping keep our community safe.",
      });
    }
  };

  const handleAddAnswer = () => {
    if (newAnswer.trim()) {
      onAddAnswer(post.id, newAnswer);
      setNewAnswer("");
      setShowAnswerForm(false);
      toast({
        title: "Answer posted!",
        description: "Your answer has been added successfully.",
      });
    }
  };

  return (
    <Card className="p-6 shadow-card hover:shadow-elegant transition-all duration-300">
      <div className="space-y-4">
        {/* Post Header */}
        <div className="flex items-start gap-3">
          <Avatar className="h-9 w-9 flex-shrink-0 mt-0.5">
            <AvatarImage src={post.authorAvatar || undefined} alt={post.authorName || "Anonymous"} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-1">
              <div>
                <span className="text-sm font-medium text-foreground">
                  {post.authorName || "Anonymous"}
                </span>
                <span className="text-xs text-muted-foreground ml-2">
                  {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                </span>
              </div>
            </div>
            <h3 className="text-lg font-semibold">{post.title}</h3>
            <p className="text-muted-foreground mb-3">{post.description}</p>
            <Badge variant="secondary" className="text-xs">
              {post.category}
            </Badge>
          </div>
        </div>

        {/* Image if present */}
        {post.imageUrl && (
          <div className="rounded-lg overflow-hidden">
            <img 
              src={post.imageUrl} 
              alt="Post content" 
              className="w-full h-48 object-cover"
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onLike(post.id)}
            className={`flex items-center space-x-1 text-muted-foreground hover:text-primary ${
              userInteraction === 'like' ? 'text-primary bg-primary/10' : ''
            }`}
          >
            <ThumbsUp className="h-4 w-4" />
            <span>{post.likes}</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDislike(post.id)}
            className={`flex items-center space-x-1 text-muted-foreground hover:text-destructive ${
              userInteraction === 'dislike' ? 'text-destructive bg-destructive/10' : ''
            }`}
          >
            <ThumbsDown className="h-4 w-4" />
            <span>{post.dislikes}</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="flex items-center space-x-1 text-muted-foreground hover:text-primary"
          >
            <Share2 className="h-4 w-4" />
            <span>Share</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowReportForm(!showReportForm)}
            className="flex items-center space-x-1 text-muted-foreground hover:text-destructive"
          >
            <Flag className="h-4 w-4" />
            <span>Report</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAnswerForm(!showAnswerForm)}
            className="flex items-center space-x-1 text-muted-foreground hover:text-primary"
          >
            <MessageCircle className="h-4 w-4" />
            <span>Answer</span>
          </Button>
        </div>

        {/* Report Form */}
        {showReportForm && (
          <div className="space-y-3 p-4 bg-muted/50 rounded-lg overflow-hidden">
            <Textarea
              placeholder="Please explain why you're reporting this post..."
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="resize-none w-full min-h-20"
            />
            <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2 sm:space-y-0">
              <Button size="sm" onClick={handleReport} className="w-full sm:w-auto">
                Submit Report
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowReportForm(false)} className="w-full sm:w-auto">
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Answer Form */}
        {showAnswerForm && (
          <div className="space-y-3 p-4 bg-muted/50 rounded-lg overflow-hidden">
            <Textarea
              placeholder="Write your answer..."
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              className="resize-none w-full min-h-20"
            />
            <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2 sm:space-y-0">
              <Button size="sm" onClick={handleAddAnswer} className="w-full sm:w-auto">
                Post Answer
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowAnswerForm(false)} className="w-full sm:w-auto">
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Answers Section */}
        {post.answers.length > 0 && (
          <div className="space-y-3 border-t pt-4">
            <h4 className="font-medium text-sm">
              {post.answers.length} {post.answers.length === 1 ? 'Answer' : 'Answers'}
            </h4>
            
            {displayedAnswers.map((answer) => (
              <div key={answer.id} className="p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={answer.authorAvatar || undefined} alt={answer.authorName || "Anonymous"} />
                    <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                      <User className="h-3 w-3" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-medium">{answer.authorName || "Anonymous"}</span>
                </div>
                <p className="text-sm mb-2">{answer.content}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center space-x-3">
                    <button
                      className="flex items-center space-x-1 hover:text-primary transition-colors cursor-pointer"
                      onClick={() => onAnswerLike?.(answer.id)}
                    >
                      <ThumbsUp className="h-3 w-3" />
                      <span>{answer.likes}</span>
                    </button>
                    <button
                      className="flex items-center space-x-1 hover:text-destructive transition-colors cursor-pointer"
                      onClick={() => onAnswerDislike?.(answer.id)}
                    >
                      <ThumbsDown className="h-3 w-3" />
                      <span>{answer.dislikes}</span>
                    </button>
                  </div>
                  <span>{formatDistanceToNow(new Date(answer.created_at), { addSuffix: true })}</span>
                </div>
              </div>
            ))}
            
            {hasMoreAnswers && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllAnswers(!showAllAnswers)}
                className="flex items-center space-x-1 text-muted-foreground"
              >
                {showAllAnswers ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    <span>Show Less</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    <span>Show All {post.answers.length} Answers</span>
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default PostCard;