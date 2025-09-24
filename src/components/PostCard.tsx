import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ThumbsUp, ThumbsDown, Share2, Flag, MessageCircle, ChevronDown, ChevronUp } from "lucide-react";
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

interface PostCardProps {
  post: Post;
  onLike: (postId: string) => void;
  onDislike: (postId: string) => void;
  onReport: (postId: string, reason: string) => void;
  onAddAnswer: (postId: string, answer: string) => void;
}

const PostCard = ({ post, onLike, onDislike, onReport, onAddAnswer }: PostCardProps) => {
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
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
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
        <div className="flex items-center space-x-4 pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onLike(post.id)}
            className="flex items-center space-x-1 text-muted-foreground hover:text-primary"
          >
            <ThumbsUp className="h-4 w-4" />
            <span>{post.likes}</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDislike(post.id)}
            className="flex items-center space-x-1 text-muted-foreground hover:text-destructive"
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
          <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
            <Textarea
              placeholder="Please explain why you're reporting this post..."
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="resize-none"
            />
            <div className="flex space-x-2">
              <Button size="sm" onClick={handleReport}>
                Submit Report
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowReportForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Answer Form */}
        {showAnswerForm && (
          <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
            <Textarea
              placeholder="Write your answer..."
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              className="resize-none"
            />
            <div className="flex space-x-2">
              <Button size="sm" onClick={handleAddAnswer}>
                Post Answer
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowAnswerForm(false)}>
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
                <p className="text-sm mb-2">{answer.content}</p>
                <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                  <span className="flex items-center space-x-1">
                    <ThumbsUp className="h-3 w-3" />
                    <span>{answer.likes}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <ThumbsDown className="h-3 w-3" />
                    <span>{answer.dislikes}</span>
                  </span>
                  <span>{answer.timestamp.toLocaleDateString()}</span>
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