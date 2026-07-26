import { useState, useEffect } from 'react';
import api from '@/lib/api';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  quartier: string;
  bio?: string;
  role: 'CLIENT' | 'PROVIDER' | 'ADMIN';
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileData {
  fullName?: string;
  phone?: string;
  quartier?: string;
  bio?: string;
}

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/auth/me');
      setProfile(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: UpdateProfileData) => {
    try {
      setIsUpdating(true);
      setError(null);
      const response = await api.patch('/auth/me', data);
      setProfile(response.data);
      return { success: true, data: response.data };
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erreur lors de la mise à jour du profil';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsUpdating(false);
    }
  };

  const uploadAvatar = async (file: File) => {
    try {
      setIsUpdating(true);
      setError(null);
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await api.post('/uploads/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setProfile(prev => prev ? { ...prev, avatar: response.data.avatarUrl } : null);
      return { success: true, avatarUrl: response.data.avatarUrl };
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erreur lors du téléchargement de l\'avatar';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    profile,
    loading,
    error,
    isUpdating,
    fetchProfile,
    updateProfile,
    uploadAvatar,
  };
}