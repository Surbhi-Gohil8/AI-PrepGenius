'use client';

import { useState, useCallback, useEffect } from 'react';
import { api } from '@/lib/api';
import { ResumeData } from '@/types';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/lib/errors';

export function useResume() {
  const { user, refreshUser } = useAuth();
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const fetchResume = useCallback(async () => {
    await Promise.resolve();
    setLoading(true);
    try {
      const response = await api.get('/resume/me');
      setResumeData(response.data.resumeData);
    } catch (error) {
      console.error('Error fetching resume:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadResumeFile = useCallback(async (file: File) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append('resume', file);

    try {
      const response = await api.post('/resume/upload', formData);
      setResumeData(response.data.resumeData);
      await refreshUser(); // Update user object in Auth context
      toast.success('Resume uploaded and parsed successfully!');
      return response.data.resumeData;
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Failed to upload and parse resume.'));
      throw error;
    } finally {
      setIsUploading(false);
    }
  }, [refreshUser]);

  const deleteResumeData = useCallback(async () => {
    setLoading(true);
    try {
      await api.delete('/resume/me');
      setResumeData(null);
      await refreshUser();
      toast.success('Resume data deleted.');
    } catch {
      toast.error('Failed to delete resume data.');
    } finally {
      setLoading(false);
    }
  }, [refreshUser]);

  useEffect(() => {
    if (!user) {
      void Promise.resolve().then(() => {
        setResumeData(null);
        setLoading(false);
      });
      return;
    }
    void fetchResume();
  }, [user, fetchResume]);

  return {
    resumeData,
    loading,
    isUploading,
    uploadResumeFile,
    deleteResumeData,
    refetchResume: fetchResume,
  };
}
