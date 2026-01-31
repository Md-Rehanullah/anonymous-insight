import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, ThumbsDown, MessageCircle, Edit, Trash2 } from "lucide-react";
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

interface ProfilePostCardProps {
  post: Post;
  onEdit: (post: Post) => void;
  onDelete: (post: Post) => void;
}

const ProfilePostCard = ({ post, onEdit, onDelete }: ProfilePostCardProps) => {
  return (
    <Card className="p-6 shadow-card hover:shadow-elegant transition-all duration-300">
      <div className="space-y-4">
        {/* Post Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-lg font-semibold">{post.title}</h3>
              <span className="text-xs text-muted-foreground ml-4 flex-shrink-0">
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </span>
            </div>
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

        {/* Stats and Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <ThumbsUp className="h-4 w-4" />
              {post.likes}
            </span>
            <span className="flex items-center gap-1">
              <ThumbsDown className="h-4 w-4" />
              {post.dislikes}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              {post.answers.length} {post.answers.length === 1 ? 'answer' : 'answers'}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(post)}
              className="text-muted-foreground hover:text-primary"
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(post)}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProfilePostCard;
