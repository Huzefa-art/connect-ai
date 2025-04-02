import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface AIModelFormProps {
  onSave: (data: any) => void;
  onCancel: () => void;
  initialData?: {
    modelName?: string;
    provider?: string;
    apiKey?: string;
    promptTemplate?: string;
  };
}

const AIModelForm: React.FC<AIModelFormProps> = ({ onSave, onCancel, initialData }) => {
  const [modelName, setModelName] = useState(initialData?.modelName || "");
  const [provider, setProvider] = useState(initialData?.provider || "");
  const [apiKey, setApiKey] = useState(initialData?.apiKey || "");
  const [promptTemplate, setPromptTemplate] = useState(initialData?.promptTemplate || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ modelName, provider, apiKey, promptTemplate });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold mb-4">AI Models Configuration</h2>
      <div className="space-y-2">
        <Label>Model Name</Label>
        <Input
          type="text"
          value={modelName}
          onChange={(e) => setModelName(e.target.value)}
          placeholder="Enter model name"
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Provider</Label>
        <Select value={provider} onValueChange={(value: string) => setProvider(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select provider" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="openai">OpenAI</SelectItem>
            <SelectItem value="anthropic">Anthropic</SelectItem>
            <SelectItem value="midjourney">Midjourney</SelectItem>
            <SelectItem value="elevenlabs">ElevenLabs</SelectItem>
            <SelectItem value="stable_diffusion">Stable Diffusion</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>API Key</Label>
        <Input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter API key"
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Default Prompt Template</Label>
        <Textarea
          value={promptTemplate}
          onChange={(e) => setPromptTemplate(e.target.value)}
          placeholder="Enter default prompt template"
          rows={4}
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="bg-[#6C47FF] hover:bg-[#5A3CD7]">
          Save Model
        </Button>
      </div>
    </form>
  );
};

export default AIModelForm;
