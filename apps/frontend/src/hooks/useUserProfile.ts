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
  avatar?: string;    // alias côté frontend
  avatarUrl?: string; // nom réel en base de données
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
      // Normalise : le backend stocke avatarUrl, le frontend utilise avatar
      const data = response.data;
      setProfile({ ...data, avatar: data.avatarUrl || data.avatar });
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
      const updated = response.data;
      setProfile({ ...updated, avatar: updated.avatarUrl || updated.avatar });
      return { success: true, data: updated };
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

      // Étape 1 : uploader le fichier sur Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      const uploadResponse = await api.post('/uploads/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const cloudinaryUrl: string = uploadResponse.data.url;

      // Étape 2 : persister l'URL en base de données via PATCH /auth/me
      const patchResponse = await api.patch('/auth/me', { avatarUrl: cloudinaryUrl });
      const updated = patchResponse.data;

      // Mettre à jour le state local avec la nouvelle photo
      setProfile({ ...updated, avatar: updated.avatarUrl || cloudinaryUrl });

      return { success: true, avatarUrl: cloudinaryUrl };
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