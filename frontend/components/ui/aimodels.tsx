import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { fetchData } from "@/utils/api";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      modelName,
      provider,
      apiKey,
      promptTemplate,
    };

    const result = await fetchData("api/v1/save-ai-model", "POST", data);

    if (result) {
      onSave(data);  
      // alert("AI Model saved successfully!");
    } else {
      alert("Failed to save AI Model.");
    }
  };
  const modelOptions: { [key: string]: string[] } = {
    openai: ["gpt-3.5-turbo", "gpt-4", "gpt-4-turbo"],
    OllamaLLM: ["llama2", "mistral", "gemma","qwen2.5:0.5b","deepseek-r1:1.5b"],
    anthropic: ["claude-1", "claude-2", "claude-3"],
    midjourney: ["v5", "v5.1", "v6"],
    stable_diffusion: ["sd-v1", "sd-v1.5", "sdxl"],
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold mb-4">AI Models Configuration</h2>
      <div className="space-y-2">
        <Label>Model Name</Label>
        <Select
          value={modelName}
          onValueChange={(value: string) => setModelName(value)}
          disabled={!provider} 
        >
          <SelectTrigger>
            <SelectValue placeholder="Select model" />
          </SelectTrigger>
          <SelectContent>
            {(modelOptions[provider] || []).map((model) => (
              <SelectItem key={model} value={model}>
                {model}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Provider</Label>
        <Select
        value={provider}
        onValueChange={(value: string) => {
          setProvider(value);
          setModelName(""); 
        }}>          
        <SelectTrigger>
          <SelectValue placeholder="Select provider" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="openai">OpenAI</SelectItem>
            <SelectItem value="OllamaLLM">OllamaLLM</SelectItem>
            <SelectItem value="anthropic">Anthropic</SelectItem>
            <SelectItem value="midjourney">Midjourney</SelectItem>
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
