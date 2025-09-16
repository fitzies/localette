"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Instagram, Facebook, Plus, ExternalLink } from "lucide-react";
import { useState } from "react";
import { updateBusiness } from "@/lib/functions";
import { toast } from "sonner";

interface SocialLinksProps {
  businessId: string;
  instagram?: string | null;
  facebook?: string | null;
}

export function SocialLinks({
  businessId,
  instagram,
  facebook,
}: SocialLinksProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentPlatform, setCurrentPlatform] = useState<
    "instagram" | "facebook" | null
  >(null);
  const [username, setUsername] = useState("");

  // Local state to track current social media values
  const [localInstagram, setLocalInstagram] = useState(instagram);
  const [localFacebook, setLocalFacebook] = useState(facebook);

  const socialPlatforms = [
    {
      name: "Instagram",
      key: "instagram" as const,
      icon: Instagram,
      color: "bg-gradient-to-br from-purple-600 to-pink-500",
      connected: !!localInstagram,
      username: localInstagram || "",
      baseUrl: "https://instagram.com/",
    },
    {
      name: "Facebook",
      key: "facebook" as const,
      icon: Facebook,
      color: "bg-blue-600",
      connected: !!localFacebook,
      username: localFacebook || "",
      baseUrl: "https://facebook.com/",
    },
  ];

  const handleConnect = (platformKey: "instagram" | "facebook") => {
    const platform = socialPlatforms.find((p) => p.key === platformKey);
    if (platform) {
      setCurrentPlatform(platformKey);
      setUsername(platform.username);
      setDialogOpen(true);
    }
  };

  const handleDisconnect = async (platformKey: "instagram" | "facebook") => {
    try {
      const updateData = { [platformKey]: null };
      await updateBusiness(businessId, updateData);

      // Update local state immediately
      if (platformKey === "instagram") {
        setLocalInstagram(null);
      } else if (platformKey === "facebook") {
        setLocalFacebook(null);
      }

      toast.success(
        `${
          platformKey.charAt(0).toUpperCase() + platformKey.slice(1)
        } disconnected successfully!`
      );
    } catch (error) {
      console.error(`Failed to disconnect ${platformKey}:`, error);
      toast.error(`Failed to disconnect ${platformKey}. Please try again.`);
    }
  };

  const handleView = (platformKey: "instagram" | "facebook") => {
    const platform = socialPlatforms.find((p) => p.key === platformKey);
    if (platform && platform.username) {
      window.open(`${platform.baseUrl}${platform.username}`, "_blank");
    }
  };

  const handleSave = async () => {
    if (currentPlatform && username.trim()) {
      try {
        const updateData = { [currentPlatform]: username.trim() };
        await updateBusiness(businessId, updateData);

        // Update local state immediately
        if (currentPlatform === "instagram") {
          setLocalInstagram(username.trim());
        } else if (currentPlatform === "facebook") {
          setLocalFacebook(username.trim());
        }

        toast.success(
          `${
            currentPlatform.charAt(0).toUpperCase() + currentPlatform.slice(1)
          } connected successfully!`
        );
      } catch (error) {
        console.error(`Failed to save ${currentPlatform} username:`, error);
        toast.error(
          `Failed to save ${currentPlatform} username. Please try again.`
        );
        return; // Don't close dialog on error
      }
    }
    setDialogOpen(false);
    setCurrentPlatform(null);
    setUsername("");
  };

  const handleCancel = () => {
    setDialogOpen(false);
    setCurrentPlatform(null);
    setUsername("");
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Social Media Links</CardTitle>
          <CardDescription>
            Connect your business social media accounts to increase your online
            presence and customer engagement.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {socialPlatforms.map((platform) => {
              const IconComponent = platform.icon;
              return (
                <div
                  key={platform.name}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg ${platform.color} flex items-center justify-center`}
                    >
                      <IconComponent className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{platform.name}</h4>
                      {platform.connected ? (
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            @{platform.username}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 text-xs text-blue-600 hover:text-blue-800"
                            onClick={() => handleView(platform.key)}
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            View Profile
                          </Button>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500">Not connected</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {platform.connected ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDisconnect(platform.key)}
                        >
                          Disconnect
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleConnect(platform.key)}
                        >
                          Edit
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                        onClick={() => handleConnect(platform.key)}
                      >
                        <Plus className="h-3 w-3" />
                        Connect
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Social Media Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {currentPlatform
                ? `Connect ${
                    socialPlatforms.find((p) => p.key === currentPlatform)?.name
                  }`
                : "Connect Social Media"}
            </DialogTitle>
            <DialogDescription>
              Enter your {currentPlatform} username to connect your business
              account.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">@</span>
                <Input
                  id="username"
                  placeholder="yourbusiness"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Enter just the username, without the @ symbol or full URL
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!username.trim()}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
