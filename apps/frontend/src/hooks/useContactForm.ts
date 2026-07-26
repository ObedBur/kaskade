import { useState } from 'react';
import api from '@/lib/api';

export interface ContactFormData {
  subject: string;
  message: string;
  attachment?: File | null;
}

export function useContactForm() {
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const sendContactForm = async (data: ContactFormData) => {
    setIsSending(true);
    setError(null);
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append('subject', data.subject);
      formData.append('message', data.message);
      if (data.attachment) {
        formData.append('attachment', data.attachment);
      }

      // Endpoint à créer côté backend, par exemple /support/contact
      await api.post('/support/contact', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess(true);
      return { success: true };
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erreur lors de l\'envoi du message.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsSending(false);
    }
  };

  return {
    isSending,
    error,
    success,
    sendContactForm,
    setError,
    setSuccess,
  };
}
