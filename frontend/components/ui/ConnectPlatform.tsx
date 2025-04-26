import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";
import { fetchData } from "@/utils/api";

const PLATFORMS = [
  { id: "whatsapp", name: "WhatsApp" },
  { id: "telegram", name: "Telegram" },
  { id: "discord", name: "Discord" },
  { id: "slack", name: "Slack" }
];

interface ConnectPlatformProps {
  onSave: (data: { platform: string; api_key: string; webhook_url: string }) => void;
  onCancel: () => void;
}

const ConnectPlatform: React.FC<ConnectPlatformProps> = ({ onSave, onCancel}) => {
  const [formData, setFormData] = React.useState({
    platform: "",
    api_key: "",
    webhook_url: ""
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Sending the POST request with the formData
      // const response = await fetch("http://localhost:8000/api/v1/connect-platform", {
        const response = await fetch("https://x6p77dm7-8000.inc1.devtunnels.ms/api/v1/connect-platform", {

        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });
  
      // Check if the response is successful
      if (response.ok) {
        const data = await response.json();
        console.log("Platform connected successfully:", data);
        onSave(formData);
        setFormData({ platform: "", api_key: "", webhook_url: "" });
        onCancel();
      } else {
        // Handle errors based on the response status
        const errorData = await response.json();
        
        if (response.status === 401) {
          alert("Invalid Discord bot token. Please check and try again.");
        } else if (response.status === 400) {
          alert("Bot already running with this token.");
        } else {
          alert("Something went wrong: " + (errorData.message || "Please try again"));
        }
      }
    } catch (error) {
      console.error("Unexpected error during platform connection:", error);
      alert("Unexpected error. Please try again.");
    }
  };
    
  const selectedPlatform = PLATFORMS.find(p => p.id === formData.platform);

  return (
    <div className="relative">
      {/* Cross / Close Button */}
      <button
        type="button"
        onClick={onCancel}
        className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
        aria-label="Close"
      >
        <X className="w-5 h-5" />
      </button>

      <h2 className="text-xl font-bold mb-4">Connect Messaging Platform</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label>Platform</Label>
          <Select
            value={formData.platform}
            onValueChange={(value: string) =>
              setFormData({ ...formData, platform: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select platform" />
            </SelectTrigger>
            <SelectContent>
              {PLATFORMS.map((platform) => (
                <SelectItem key={platform.id} value={platform.id}>
                  {platform.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedPlatform && (
          <>
            <div className="space-y-2">
              <Label htmlFor="api_key">API Key</Label>
              <Input
                id="api_key"
                type="password"
                value={formData.api_key}
                onChange={(e) =>
                  setFormData({ ...formData, api_key: e.target.value })
                }
                placeholder={`${selectedPlatform.name} API Key`}
                required
              />
            </div>
            <div className="space-y-2">
            <Label htmlFor="webhook">Webhook URL</Label>
            <Input
              id="webhook"
              type="text" 
              value={formData.webhook_url}
              onChange={(e) =>
                setFormData({ ...formData, webhook_url: e.target.value })
              }
              placeholder="Enter webhook URL"
            />
          </div>
          </>
        )}

        <Button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700"
          disabled={isSubmitting || !formData.platform}

        >
          Connect Platform
        </Button>
      </form>
    </div>
  );
};

export default ConnectPlatform;
