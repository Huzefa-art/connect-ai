import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { fetchFormData } from "@/utils/api";

interface FileUploadButtonProps {
  onFileUploaded: (doc: { id: string; docName: string }) => void;
}

const FileUploadButton: React.FC<FileUploadButtonProps> = ({ onFileUploaded }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];
    if (!allowedTypes.includes(file.type)) {
      alert("Please select a PDF or DOCX file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const result = await fetchFormData("api/v1/upload", formData);
      if (result) {
        console.log("File upload successful:", result);
        // Call the onFileUploaded callback with document details.
        // Adjust property names if your API returns different keys.
        onFileUploaded({ id: result.id, docName: result.filename });
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
        onClick={handleButtonClick}
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
