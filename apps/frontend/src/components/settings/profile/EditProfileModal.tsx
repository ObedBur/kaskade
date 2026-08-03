"use client";

import { useState, useEffect, useRef } from 'react';
import { UpdateProfileData } from '@/hooks/useUserProfile';
import { X, Save, Loader2, User, Phone, MapPin, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: UpdateProfileData) => Promise<{ success: boolean; error?: string | null }>;
  initialData: UpdateProfileData;
}

export default function EditProfileModal({ isOpen, onClose, onSave, initialData }: EditProfileModalProps) {
  const [formData, setFormData] = useState<UpdateProfileData>(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Sync form data when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData(initialData);
      setSaveError(null);
    }
  }, [isOpen, initialData]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleChange = (field: keyof UpdateProfileData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaveError(null);
    setIsSaving(true);
    const result = await onSave(formData);
    setIsSaving(false);
    if (result.success) {
      onClose();
    } else {
      setSaveError(result.error ?? 'Une erreur est survenue.');
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={overlayRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleOverlayClick}
          className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4"
        >
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="w-full sm:max-w-md md:max-w-2xl bg-[#FCFBF7] rounded-t-[28px] sm:rounded-[28px] shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[var(--settings-border)]">
              <div>
                <h3 className="text-base font-black uppercase tracking-widest text-[var(--chocolat)]">Modifier le profil</h3>
                <p className="text-[10px] text-[var(--ocre)] font-bold uppercase tracking-[0.2em] mt-0.5">Informations personnelles</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-[var(--settings-hover)] text-[var(--chocolat-muted)] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form Body */}
            <div className="px-6 py-6 space-y-6 max-h-[75vh] overflow-y-auto">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <label className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold text-[var(--chocolat-muted)] uppercase tracking-widest">
                    <User className="h-3.5 w-3.5 text-[var(--ocre)]" />
                    Nom complet
                  </label>
                  <input
                    type="text"
                    value={formData.fullName || ''}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                    placeholder="Ex: Jean Dupont"
                    className="w-full rounded-xl border border-[var(--settings-border)] bg-white px-4 py-3 sm:py-4 text-sm sm:text-base font-semibold text-[var(--chocolat)] focus:outline-none focus:border-[var(--ocre)] focus:ring-2 focus:ring-[var(--ocre)]/10 transition-all placeholder:text-[var(--chocolat-muted)]/40"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold text-[var(--chocolat-muted)] uppercase tracking-widest">
                    <Phone className="h-3.5 w-3.5 text-[var(--ocre)]" />
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="+243 8XX XXX XXX"
                    className="w-full rounded-xl border border-[var(--settings-border)] bg-white px-4 py-3 sm:py-4 text-sm sm:text-base font-semibold text-[var(--chocolat)] focus:outline-none focus:border-[var(--ocre)] focus:ring-2 focus:ring-[var(--ocre)]/10 transition-all placeholder:text-[var(--chocolat-muted)]/40"
                  />
                </div>

                {/* Quartier */}
                <div className="space-y-2 sm:col-span-2">
                  <label className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold text-[var(--chocolat-muted)] uppercase tracking-widest">
                    <MapPin className="h-3.5 w-3.5 text-[var(--ocre)]" />
                    Quartier
                  </label>
                  <input
                    type="text"
                    value={formData.quartier || ''}
                    onChange={(e) => handleChange('quartier', e.target.value)}
                    placeholder="Ex: Gombe, Limete..."
                    className="w-full rounded-xl border border-[var(--settings-border)] bg-white px-4 py-3 sm:py-4 text-sm sm:text-base font-semibold text-[var(--chocolat)] focus:outline-none focus:border-[var(--ocre)] focus:ring-2 focus:ring-[var(--ocre)]/10 transition-all placeholder:text-[var(--chocolat-muted)]/40"
                  />
                </div>

                {/* Bio */}
                <div className="space-y-2 sm:col-span-2">
                  <label className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold text-[var(--chocolat-muted)] uppercase tracking-widest">
                    <FileText className="h-3.5 w-3.5 text-[var(--ocre)]" />
                    Bio
                  </label>
                  <textarea
                    value={formData.bio || ''}
                    onChange={(e) => handleChange('bio', e.target.value)}
                    placeholder="Décrivez-vous en quelques mots..."
                    rows={4}
                    className="w-full rounded-xl border border-[var(--settings-border)] bg-white px-4 py-3 sm:py-4 text-sm sm:text-base font-semibold text-[var(--chocolat)] focus:outline-none focus:border-[var(--ocre)] focus:ring-2 focus:ring-[var(--ocre)]/10 transition-all placeholder:text-[var(--chocolat-muted)]/40 resize-none"
                  />
                </div>
              </div>

              {/* Error message */}
              {saveError && (
                <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs sm:text-sm font-semibold text-red-600">
                  {saveError}
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="flex gap-3 px-6 pb-6 pt-4 border-t border-[var(--settings-border)]">
              <button
                onClick={onClose}
                disabled={isSaving}
                className="flex-1 rounded-2xl border border-[var(--settings-border-strong)] py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--chocolat-muted)] hover:bg-[var(--settings-hover)] transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 rounded-2xl bg-[var(--chocolat)] py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white hover:bg-[var(--ocre)] transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isSaving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
