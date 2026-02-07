import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, User, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ProfileSettingsProps {
  userId: string;
  displayName: string | null;
  avatarUrl: string | null;
  onUpdate: () => void;
}

const ProfileSettings = ({ userId, displayName, avatarUrl, onUpdate }: ProfileSettingsProps) => {
  const [name, setName] = useState(displayName || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(avatarUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 2MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Create a local preview
      const localPreview = URL.createObjectURL(file);
      setPreviewUrl(localPreview);

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/avatar.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Add cache-busting query param
      const urlWithCacheBust = `${publicUrl}?t=${Date.now()}`;

      // Update profile with new avatar URL (use upsert to handle missing profile row)
      const { data: updateData, error: updateError } = await supabase
        .from('profiles')
        .upsert({ user_id: userId, avatar_url: urlWithCacheBust }, { onConflict: 'user_id' })
        .select();

      if (updateError) throw updateError;
      console.log('Avatar update result:', updateData);

      setPreviewUrl(urlWithCacheBust);
      onUpdate();

      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated.",
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setPreviewUrl(avatarUrl);
      toast({
        title: "Upload failed",
        description: "Failed to upload avatar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveName = async () => {
    if (!name.trim()) return;

    setIsSaving(true);
    try {
      const { data, error, count } = await supabase
        .from('profiles')
        .update({ display_name: name.trim() })
        .eq('user_id', userId)
        .select();

      if (error) throw error;

      console.log('Profile update result:', { data, count, userId });

      if (!data || data.length === 0) {
        // No row was updated — maybe profile doesn't exist yet, try upsert
        const { error: upsertError } = await supabase
          .from('profiles')
          .upsert({ user_id: userId, display_name: name.trim() }, { onConflict: 'user_id' });
        
        if (upsertError) throw upsertError;
      }

      onUpdate();
      toast({
        title: "Profile updated",
        description: "Your display name has been updated.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="p-6 shadow-card">
      <h2 className="text-lg font-semibold mb-6">Profile Settings</h2>
      
      <div className="space-y-6">
        {/* Avatar Upload */}
        <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
          <div className="relative group">
            <Avatar className="h-24 w-24 border-4 border-primary/20">
              <AvatarImage src={previewUrl || undefined} alt="Profile avatar" />
              <AvatarFallback className="bg-gradient-primary text-white text-2xl">
                <User className="h-12 w-12" />
              </AvatarFallback>
            </Avatar>
            
            <button
              onClick={handleAvatarClick}
              disabled={isUploading}
              className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <Loader2 className="h-6 w-6 text-white animate-spin" />
              ) : (
                <Camera className="h-6 w-6 text-white" />
              )}
            </button>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
          
          <div className="flex-1 text-center sm:text-left">
            <p className="text-sm text-muted-foreground mb-1">Profile Picture</p>
            <p className="text-xs text-muted-foreground">
              Click the avatar to upload a new picture. Max size: 2MB.
            </p>
          </div>
        </div>

        {/* Display Name */}
        <div className="space-y-2">
          <Label htmlFor="displayName">Display Name</Label>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              id="displayName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your display name"
              className="flex-1"
            />
            <Button 
              onClick={handleSaveName} 
              disabled={isSaving || !name.trim() || name.trim() === displayName}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProfileSettings;
