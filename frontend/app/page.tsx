"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { fetchData } from "@/utils/api"; 
import AIModelForm from "@/components/ui/aimodels"; 
import WorkflowBuilder from '@/components/ui/WorkflowBuilder'; 
import ConnectPlatform from "@/components/ui/ConnectPlatform"
import FileUploadButton from "@/components/ui/FileUpload";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"chat" | "ai-models" | "workflows">("chat")
  const [aiModels, setAiModels] = useState<
  { id: string; modelName: string; provider: string; apiKey: string; promptTemplate: string }[]>([]);
  const [platforms, setPlatforms] = useState<{ id: string; platformName: string }[]>([]);
  const [docs, setDocs] = useState<{ id: string; docName: string }[]>([]);
  const [workflowNodes, setWorkflowNodes] = useState<any[]>([]);
  const [workflowEdges, setWorkflowEdges] = useState<any[]>([]);
  
  const [message, setMessage] = useState("");

  // const [response, setResponse] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showConnectPlatform, setConnectPlatform] = useState(false);

  // const [messages, setMessages] = useState<{ sender: "user" | "bot"; text: string }[]>([]);
  const [messages, setMessages] = useState<{ sender: "user" | "bot" | "system"; text: string }[]>([
    {
      sender: "system",
      text: "Hello! You can explore and test the platform here. Please note that it is still in development, and its current purpose is to showcase our MVP and the core idea of what we aim to build. Many features are not yet functional, as this is just a preview of what our app will include in the future."
    }
  ]);  

  const handleDocumentSave = (doc: { id: string; docName: string }) => {
    setDocs((prevDocs) => [...prevDocs, doc]);
  };
  
  const handleconnectSave = (data: { platform: string; api_key: string; webhook_url: string }) => {
    const PLATFORMS = [
      { id: "whatsapp", name: "WhatsApp" },
      { id: "telegram", name: "Telegram" },
      { id: "discord", name: "Discord" },
      { id: "slack", name: "Slack" },
    ];
  
    const platformName = PLATFORMS.find(p => p.id === data.platform)?.name || data.platform;
  
    const newPlatform = {
      id: data.platform,
      platformName,
    };
  
    setPlatforms(prev => [...prev, newPlatform]);
    setConnectPlatform(false);
  };
  
  

  const handleChat = async () => {
    if (!message.trim()) return; // Prevent sending if input is empty
    setMessage("");

    // Add user's message to chat history
    setMessages((prevMessages) => [...prevMessages, { sender: "user", text: message }]);
    
    const data = await fetchData("api/v1/get_response", "POST", { msg: message });
    if (data) {
      setMessages((prevMessages) => [...prevMessages, { sender: "bot", text: data.response }]);
      // setMessage(""); // Clear input after sending
    }
  };
  
  const handleSave = (data: { modelName: string; provider: string; apiKey: string; promptTemplate: string }) => {
    const newModel = { ...data, id: Date.now().toString() }; // Add a unique ID
    setAiModels((prevModels) => [...prevModels, newModel]);
    setShowForm(false); 
  };

  const handleCancel = () => {
    setShowForm(false);
  };

  // const handleChat = async () => {
  //   if (!message.trim()) {
  //     return; // Prevent sending if input is empty
  //   }
  //   const data = await fetchData('get_response', 'POST', { msg: message });
  //   if (data) {
  //     setResponse(data.response); // Set the response in state
  //     setMessage("");
  //   }
  // };

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div className="w-[220px] border-r border-gray-200 flex flex-col">
        <div className="p-4 flex items-center gap-2">
          <div className="w-6 h-6 bg-[#6C47FF] rounded flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-bot"
            >
              <path d="M12 8V4H8" />
              <rect width="16" height="12" x="4" y="8" rx="2" />
              <path d="M2 14h2" />
              <path d="M20 14h2" />
              <path d="M15 13v2" />
              <path d="M9 13v2" />
            </svg>
          </div>
          <h1 className="font-bold text-lg">Connect-AI</h1>
        </div>

        <div className="mt-6 flex flex-col">
          <Link href="#" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100">
            <div className="w-5 h-5 text-[#6C47FF]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-bot"
              >
                <path d="M12 8V4H8" />
                <rect width="16" height="12" x="4" y="8" rx="2" />
                <path d="M2 14h2" />
                <path d="M20 14h2" />
                <path d="M15 13v2" />
                <path d="M9 13v2" />
              </svg>
            </div>
            <span className="text-gray-800">My Chatbots</span>
          </Link>

          <Link href="#" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100">
            <div className="w-5 h-5 text-[#6C47FF]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-message-square"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <span className="text-gray-800">Conversations</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="border-b border-gray-200 px-6 py-2">
          <div className="flex space-x-6">
            <button
              onClick={() => setActiveTab("chat")}
              className={`px-4 py-2 text-gray-800 ${activeTab === "chat" ? "border-b-2 border-[#6C47FF]" : ""}`}
            >
              Chat
            </button>
            <button
              onClick={() => setActiveTab("ai-models")}
              className={`px-4 py-2 text-gray-800 ${activeTab === "ai-models" ? "border-b-2 border-[#6C47FF]" : ""}`}
            >
              AI Models
            </button>
            <button
              onClick={() => setActiveTab("workflows")}
              className={`px-4 py-2 text-gray-800 ${activeTab === "workflows" ? "border-b-2 border-[#6C47FF]" : ""}`}
            >
              Workflows
            </button>
          </div>
        </div>

        <div className="flex-1 p-6 flex flex-col">
          {activeTab === "chat" && (
            <>
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-[#6C47FF] rounded flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-bot"
                    >
                      <path d="M12 8V4H8" />
                      <rect width="16" height="12" x="4" y="8" rx="2" />
                      <path d="M2 14h2" />
                      <path d="M20 14h2" />
                      <path d="M15 13v2" />
                      <path d="M9 13v2" />
                    </svg>
                  </div>
                  <span className="font-medium text-lg">AI Assistant</span>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" size="sm" className="text-gray-800 border-gray-300 h-9">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-user-plus mr-2"
                    >
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <line x1="19" x2="19" y1="8" y2="14" />
                      <line x1="22" x2="16" y1="11" y2="11" />
                    </svg>
                    Invite User
                  </Button>
                  <div>
                  <FileUploadButton onFileUploaded={handleDocumentSave} />
                  </div>
                  {/* <Button variant="outline" size="sm" className="text-gray-800 border-gray-300 h-9">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-file mr-2"
                    >
                      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                    </svg>
                    Choose File
                    <span className="ml-1 text-gray-500 text-xs">No fi...osen</span>
                  </Button> */}

                  <Button variant="outline" size="sm" className="text-gray-800 border-gray-300 h-9" onClick={() => setConnectPlatform(true)}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-link mr-2"
                    >
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                    Connect Platform
                  </Button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[70vh]">
              {/* message area */}
              {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`p-3 rounded-lg max-w-[80%] md:max-w-[60%] lg:max-w-[50%] break-words ${msg.sender === "user" ? "bg-blue-500 text-white" : "bg-gray-200 text-black"}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
            {/* connectplatform */}
            {showConnectPlatform && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="bg-white p-6 rounded-lg w-full max-w-md">
              <ConnectPlatform onSave={handleconnectSave} onCancel={() => setConnectPlatform(false)} />
              </div>
            </div>
)}



              {/* <div className="flex-1 overflow-auto">
                
                <div className="flex gap-3 mb-4">
                  <div className="w-8 h-8 bg-[#6C47FF] rounded flex items-center justify-center flex-shrink-0 mt-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-bot"
                    >
                      <path d="M12 8V4H8" />
                      <rect width="16" height="12" x="4" y="8" rx="2" />
                      <path d="M2 14h2" />
                      <path d="M20 14h2" />
                      <path d="M15 13v2" />
                      <path d="M9 13v2" />
                    </svg>
                  </div> 
                  <div className="bg-gray-100 rounded-lg p-4 max-w-3xl">
                    <p className="text-gray-800">
                      Hello! You can explore and test the platform here. Please note that it is still in development,
                      and its current purpose is to showcase our MVP and the core idea of what we aim to build. Many
                      features are not yet functional, as this is just a preview of what our app will include in the
                      future.
                    </p>
                  </div>
                </div>
              </div> */}

              <div className="mt-4 border-t pt-4">
                <div className="flex gap-2">
                <Input
                placeholder="Type your message..."
                className="flex-1 border-gray-300 focus-visible:ring-[#6C47FF]"
                value={message} 
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleChat(); 
                  }
                }}
              />
                  <Button className="bg-[#6C47FF] hover:bg-[#5A3CD7] h-10 w-10 p-0" onClick={handleChat}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-send"
                    >
                      <path d="m22 2-7 20-4-9-9-4Z" />
                      <path d="M22 2 11 13" />
                    </svg>
                  </Button>
                </div>
              </div>
            </>
          )}

          {activeTab === "ai-models" && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-center mb-16">
                <div className="flex items-center gap-2">
                  <div className="text-[#6C47FF]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-cpu"
                    >
                      <rect x="4" y="4" width="16" height="16" rx="2" />
                      <rect x="9" y="9" width="6" height="6" />
                      <path d="M15 2v2" />
                      <path d="M15 20v2" />
                      <path d="M2 15h2" />
                      <path d="M2 9h2" />
                      <path d="M20 15h2" />
                      <path d="M20 9h2" />
                      <path d="M9 2v2" />
                      <path d="M9 20v2" />
                    </svg>
                  </div>
                  <span className="font-medium text-lg">AI Models Configuration</span>
                </div>

                <Button className="bg-[#6C47FF] hover:bg-[#5A3CD7]" onClick={() => setShowForm(true)} >Add Model</Button>
              </div>

            {aiModels.length > 0 ? (
                <div className="space-y-4">
                  {aiModels.map((model, index) => (
                    <div key={index} className="p-4 border rounded-lg bg-gray-100">
                      <h3 className="font-bold text-lg">{model.modelName}</h3>
                      <p className="text-sm text-gray-600">Provider: {model.provider}</p>
                      <p className="text-sm text-gray-600">API Key: {model.apiKey}</p>
                      <p className="text-sm text-gray-600">Prompt Template: {model.promptTemplate}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 mb-4 text-gray-300">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-cpu"
                    >
                      <rect x="4" y="4" width="16" height="16" rx="2" />
                      <rect x="9" y="9" width="6" height="6" />
                      <path d="M15 2v2" />
                      <path d="M15 20v2" />
                      <path d="M2 15h2" />
                      <path d="M2 9h2" />
                      <path d="M20 15h2" />
                      <path d="M20 9h2" />
                      <path d="M9 2v2" />
                      <path d="M9 20v2" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">No AI Models Configured</h3>
                  <p className="text-gray-500">Add your first AI model to start building workflows</p>
                </div>
              )}
            </div>
          )}
          {/* Modal overlay for the form */}
          {showForm && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
              <AIModelForm onSave={handleSave} onCancel={() => setShowForm(false)} />
            </div>
          </div>
            )}

        {/* Inside your workflows tab section: */}
        {/* {activeTab === "workflows" && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <div className="text-[#6C47FF]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-workflow"
                  >
                    <rect width="8" height="8" x="3" y="3" rx="2" />
                    <path d="M7 11v4a2 2 0 0 0 2 2h4" />
                    <rect width="8" height="8" x="13" y="13" rx="2" />
                  </svg>
                </div>
                <span className="font-medium text-lg">Workflow Builder</span>
              </div>
              <Button className="bg-[#6C47FF] hover:bg-[#5A3CD7]">Add AI Models First</Button>
            </div>

            <div className="flex-1">
              Pass the saved aiModels state into the WorkflowBuilder
            </div>
          </div>
        )} */}
        {activeTab === "workflows" && (
          <WorkflowBuilder aiModels={aiModels} platforms={platforms} uploadedDocs={docs} 
          nodes={workflowNodes}
          setNodes={setWorkflowNodes}
          edges={workflowEdges}
          setEdges={setWorkflowEdges}/>
        )}

        </div>
      </div>
      
    </div>
  )
}

