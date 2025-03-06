
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, File, X } from "lucide-react";

interface FileUploadProps {
  onFileSelected: (file: File | null) => void;
}

export function FileUpload({ onFileSelected }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      onFileSelected(selectedFile);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    onFileSelected(null);
  };

  return (
    <div className="space-y-4">
      {!file ? (
        <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 hover:border-primary/50 transition-colors">
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            id="resume-upload"
            onChange={handleFileChange}
          />
          <Upload className="h-8 w-8 text-muted-foreground mb-2" />
          <label
            htmlFor="resume-upload"
            className="text-sm text-muted-foreground cursor-pointer hover:text-primary"
          >
            Click to upload or drag and drop
          </label>
          <p className="text-xs text-muted-foreground mt-1">
            PDF, DOC, or DOCX (max 5MB)
          </p>
        </div>
      ) : (
        <div className="flex items-center justify-between border rounded-lg p-4">
          <div className="flex items-center gap-2">
            <File className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">{file.name}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRemoveFile}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
