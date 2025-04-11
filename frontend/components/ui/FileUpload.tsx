import React, { useRef } from "react";
import { Button } from "@/components/ui/button";

const FileUploadButton: React.FC = () => {
  // Reference for the hidden file input element
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Trigger file dialog when button is clicked
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  // Handle file selection and upload process
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return; // No file selected

    // Check if the file type is allowed (PDF or DOCX)
    // Note: DOCX MIME type can vary across browsers
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];
    if (!allowedTypes.includes(file.type)) {
      alert("Please select a PDF or DOCX file.");
      return;
    }

    // Create a FormData object for file upload
    const formData = new FormData();
    formData.append("file", file);

    try {
      // Replace '/upload' with your actual file upload API endpoint
      const response = await fetch("/upload", {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        console.log("File upload successful");
        // Further processing if needed, e.g. update UI or clear selected file
      } else {
        console.error("File upload failed");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        className="text-gray-800 border-gray-300 h-9"
        onClick={handleButtonClick} // Trigger file input when button is clicked
      >
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
        <span className="ml-1 text-gray-500 text-xs">No file chosen</span>
      </Button>

      {/* Hidden file input to trigger file selection */}
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: "none" }} 
        accept=".pdf, .docx" 
        onChange={handleFileChange} 
      />
    </>
  );
};

export default FileUploadButton;
