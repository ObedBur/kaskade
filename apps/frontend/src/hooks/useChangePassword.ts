import { useState } from 'react';
import api from '@/lib/api';

export interface ChangePasswordData {
  oldPassword?: string;
  newPassword?: string;
}

export function useChangePassword() {
  const [isChanging, setIsChanging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const changePassword = async (data: ChangePasswordData) => {
    setIsChanging(true);
    setError(null);
    setSuccess(false);

    try {
      await api.patch('/auth/me', {
        password: data.newPassword,
        // Le backend pourrait avoir besoin de l'ancien mot de passe pour vérification
        // S'il est géré différemment (ex: /auth/change-password), il faudra adapter.
        // Pour l'instant, on se base sur le PATCH /auth/me qui semble prendre un `password`.
      });
      setSuccess(true);
      return { success: true };
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erreur lors du changement de mot de passe.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsChanging(false);
    }
  };

  return {
    isChanging,
    error,
    success,
    changePassword,
    setError, 
    setSuccess
  };
}
