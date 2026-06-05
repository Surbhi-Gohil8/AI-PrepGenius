'use client';

import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FileText, Loader2, CheckCircle2, UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useResume } from '@/hooks/useResume';

interface ResumeUploadProps {
  onSuccess: (data: any) => void;
}

export default function ResumeUpload({ onSuccess }: ResumeUploadProps) {
  const { uploadResumeFile, isUploading } = useResume();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const handleFile = useCallback(async (file: File) => {
    const isPDF = file.type === 'application/pdf' || file.name.endsWith('.pdf');
    const isDOCX = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name.endsWith('.docx');
    
    if (!isPDF && !isDOCX) {
      alert('Invalid file format. Only PDF and DOCX resumes are supported.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Resume file size exceeds the 5MB limit.');
      return;
    }

    setFileName(file.name);
    setFileSize(formatBytes(file.size));
    
    try {
      const parsedData = await uploadResumeFile(file);
      setUploadSuccess(true);
      setTimeout(() => {
        onSuccess(parsedData);
      }, 1500);
    } catch (err) {
      console.error(err);
      setUploadSuccess(false);
    }
  }, [uploadResumeFile, onSuccess]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <motion.div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        animate={{
          borderColor: isDragging ? 'var(--primary)' : 'var(--border)',
          backgroundColor: isDragging ? 'var(--primary-glow)' : 'transparent',
          scale: isDragging ? 1.01 : 1,
        }}
        transition={{ duration: 0.2 }}
        className="flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer min-h-[300px] hover:border-indigo-500/50 hover:bg-card/40 transition-colors duration-300"
        onClick={triggerFileInput}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          accept=".pdf,.docx"
          className="hidden"
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 text-indigo-500 animate-spin" />
            <h3 className="text-lg font-semibold text-text-primary">Parsing Resume Content</h3>
            <p className="text-sm text-text-secondary">Analyzing experience, skills, and projects...</p>
          </div>
        ) : uploadSuccess ? (
          <div className="flex flex-col items-center gap-4">
            <motion.div
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500"
            >
              <CheckCircle2 className="h-10 w-10" />
            </motion.div>
            <h3 className="text-lg font-semibold text-text-primary">Resume Uploaded Successfully!</h3>
            <p className="text-sm text-text-secondary">{fileName} ({fileSize})</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-500">
              <FileText className="h-10 w-10" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-text-primary">Drop your resume here</h3>
              <p className="text-sm text-text-secondary mt-1">PDF or DOCX, max 5MB</p>
            </div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="button"
                variant="outline"
                className="mt-2 border-indigo-500/30 text-indigo-500 hover:bg-indigo-500/10 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  triggerFileInput();
                }}
              >
                Browse Files
              </Button>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
