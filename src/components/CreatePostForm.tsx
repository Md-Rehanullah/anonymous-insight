import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { PlusCircle, Image, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CreatePostFormProps {
  onCreatePost: (post: {
    title: string;
    description: string;
    category: string;
    imageUrl?: string;
  }) => void;
}

const categories = [
  "Education",
  "Entertainment", 
  "Sports",
  "News",
  "Technology",
  "Health",
  "Science",
  "Politics",
  "Business",
  "Arts",
  "Travel",
  "Food",
  "Other"
];

const CreatePostForm = ({ onCreatePost }: CreatePostFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim() || !category) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    onCreatePost({
      title: title.trim(),
      description: description.trim(), 
      category,
      imageUrl: imageUrl.trim() || undefined,
    });

    // Reset form
    setTitle("");
    setDescription("");
    setCategory("");
    setImageUrl("");
    setIsOpen(false);

    toast({
      title: "Post created!",
      description: "Your question/content has been posted successfully.",
    });
  };

  if (!isOpen) {
    return (
      <Card className="p-6 mb-8 shadow-card hover:shadow-elegant transition-all duration-300 cursor-pointer bg-gradient-card" onClick={() => setIsOpen(true)}>
        <div className="flex items-center justify-center space-x-2 text-muted-foreground hover:text-primary transition-colors">
          <PlusCircle className="h-5 w-5" />
          <span className="font-medium">Write Content / Ask Question</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 mb-8 shadow-elegant">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Create New Post</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(false)}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title/Heading *</Label>
          <Input
            id="title"
            placeholder="Enter your question or content title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description/Question *</Label>
          <Textarea
            id="description"
            placeholder="Provide more details about your question or content..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="resize-none"
            rows={4}
            maxLength={1000}
          />
          <div className="text-xs text-muted-foreground text-right">
            {description.length}/1000
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="image">Image URL (Optional)</Label>
          <div className="flex space-x-2">
            <Input
              id="image"
              placeholder="Paste image URL here..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
            <Button type="button" variant="outline" size="sm" className="px-3">
              <Image className="h-4 w-4" />
            </Button>
          </div>
          {imageUrl && (
            <div className="mt-2">
              <img 
                src={imageUrl} 
                alt="Preview" 
                className="max-w-full h-32 object-cover rounded-lg"
                onError={() => setImageUrl("")}
              />
            </div>
          )}
        </div>

        <div className="flex space-x-3 pt-4">
          <Button type="submit" className="flex-1">
            Post Question/Content
          </Button>
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default CreatePostForm;