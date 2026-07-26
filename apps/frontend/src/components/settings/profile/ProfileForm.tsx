"use client";

import { useState, useEffect } from 'react';
import { useUserProfile, UpdateProfileData } from '@/hooks/useUserProfile';
import { UserRound, User, Mail, Phone, FileText, Map, MapPin, Building, Loader2, Edit3, Save, X } from 'lucide-react';

export default function ProfileForm() {
  const { profile, loading, error, isUpdating, updateProfile } = useUserProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UpdateProfileData>({});
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName,
        phone: profile.phone,
        quartier: profile.quartier,
        bio: profile.bio || '',
      });
    }
  }, [profile]);

  const handleInputChange = (field: keyof UpdateProfileData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaveError(null);
    const result = await updateProfile(formData);
    
    if (result.success) {
      setIsEditing(false);
    } else {
      setSaveError(result.error);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        fullName: profile.fullName,
        phone: profile.phone,
        quartier: profile.quartier,
        bio: profile.bio || '',
      });
    }
    setIsEditing(false);
    setSaveError(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--ocre)]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50/50 px-6 py-8 text-center">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 rounded-lg bg-[var(--ocre)] px-4 py-2 text-white text-sm"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-8">
        <p className="text-[var(--chocolat-muted)]">Aucune donnée de profil disponible</p>
      </div>
    );
  }

  const displayName = profile.fullName || 'Utilisateur';
  const [firstName, ...lastNameParts] = displayName.split(' ');
  const lastName = lastNameParts.join(' ');

  return (
    <div className="space-y-6">
      {/* En-tête du profil */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[var(--settings-ocre-soft)] text-[var(--ocre)]">
            {profile.avatar ? (
              <img 
                src={profile.avatar} 
                alt={displayName}
                className="h-20 w-20 rounded-full object-cover"
              />
            ) : (
              <UserRound className="h-8 w-8" />
            )}
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-tight text-[var(--chocolat)]">{displayName}</h3>
            <p className="text-sm text-[var(--chocolat-muted)] capitalize">{profile.role.toLowerCase()}</p>
            {profile.quartier && (
              <p className="mt-1 text-sm flex items-center gap-1.5 text-[var(--chocolat-muted)]">
                <MapPin className="h-3.5 w-3.5" />
                {profile.quartier}, RDC
              </p>
            )}
          </div>
        </div>
        
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            type="button"
            className="shrink-0 rounded-lg border border-[color:var(--settings-border-strong)] px-5 py-2.5 text-xs font-bold uppercase tracking-[0.22em] text-[var(--ocre)] transition-colors hover:bg-[var(--settings-hover)] flex items-center gap-2"
          >
            <Edit3 className="h-4 w-4" />
            Modifier
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={isUpdating}
              type="button"
              className="shrink-0 rounded-lg bg-[var(--ocre)] px-5 py-2.5 text-xs font-bold uppercase tracking-[0.22em] text-white transition-colors hover:opacity-90 flex items-center gap-2 disabled:opacity-50"
            >
              {isUpdating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Enregistrer
            </button>
            <button
              onClick={handleCancel}
              disabled={isUpdating}
              type="button"
              className="shrink-0 rounded-lg border border-[color:var(--settings-border-strong)] px-5 py-2.5 text-xs font-bold uppercase tracking-[0.22em] text-[var(--chocolat-muted)] transition-colors hover:bg-[var(--settings-hover)] flex items-center gap-2 disabled:opacity-50"
            >
              <X className="h-4 w-4" />
              Annuler
            </button>
          </div>
        )}
      </div>

      {saveError && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {saveError}
        </div>
      )}

      {/* Informations personnelles */}
      <div className="grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2">
        <div className="flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--settings-ocre-soft)] text-[var(--ocre)]">
            <User className="h-5 w-5" />
          </div>
          <div className="flex flex-col justify-center min-w-0">
            <p className="mb-0.5 text-[11px] font-medium text-[var(--chocolat-muted)]">Prénom</p>
            {isEditing ? (
              <input
                type="text"
                value={formData.fullName?.split(' ')[0] || ''}
                onChange={(e) => handleInputChange('fullName', `${e.target.value} ${lastName}`)}
                className="text-sm font-semibold text-[var(--chocolat)] bg-transparent border-b border-[var(--settings-border)] focus:outline-none focus:border-[var(--ocre)]"
              />
            ) : (
              <p className="text-sm font-semibold text-[var(--chocolat)] truncate">{firstName}</p>
            )}
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--settings-ocre-soft)] text-[var(--ocre)]">
            <User className="h-5 w-5" />
          </div>
          <div className="flex flex-col justify-center min-w-0">
            <p className="mb-0.5 text-[11px] font-medium text-[var(--chocolat-muted)]">Nom</p>
            {isEditing ? (
              <input
                type="text"
                value={lastName}
                onChange={(e) => handleInputChange('fullName', `${firstName} ${e.target.value}`)}
                className="text-sm font-semibold text-[var(--chocolat)] bg-transparent border-b border-[var(--settings-border)] focus:outline-none focus:border-[var(--ocre)]"
              />
            ) : (
              <p className="text-sm font-semibold text-[var(--chocolat)] truncate">{lastName}</p>
            )}
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--settings-ocre-soft)] text-[var(--ocre)]">
            <Mail className="h-5 w-5" />
          </div>
          <div className="flex flex-col justify-center min-w-0">
            <p className="mb-0.5 text-[11px] font-medium text-[var(--chocolat-muted)]">Adresse email</p>
            <p className="text-sm font-semibold text-[var(--chocolat)] truncate">{profile.email}</p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--settings-ocre-soft)] text-[var(--ocre)]">
            <Phone className="h-5 w-5" />
          </div>
          <div className="flex flex-col justify-center min-w-0">
            <p className="mb-0.5 text-[11px] font-medium text-[var(--chocolat-muted)]">Téléphone</p>
            {isEditing ? (
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="text-sm font-semibold text-[var(--chocolat)] bg-transparent border-b border-[var(--settings-border)] focus:outline-none focus:border-[var(--ocre)]"
              />
            ) : (
              <p className="text-sm font-semibold text-[var(--chocolat)]">{profile.phone}</p>
            )}
          </div>
        </div>

        <div className="flex gap-4 sm:col-span-2">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--settings-ocre-soft)] text-[var(--ocre)]">
            <FileText className="h-5 w-5" />
          </div>
          <div className="flex flex-col justify-center min-w-0 flex-1">
            <p className="mb-0.5 text-[11px] font-medium text-[var(--chocolat-muted)]">Bio</p>
            {isEditing ? (
              <textarea
                value={formData.bio || ''}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Décrivez-vous en quelques mots..."
                className="text-sm font-semibold text-[var(--chocolat)] bg-transparent border border-[var(--settings-border)] rounded-lg p-2 focus:outline-none focus:border-[var(--ocre)] resize-none"
                rows={2}
              />
            ) : (
              <p className="text-sm font-semibold text-[var(--chocolat)] leading-relaxed">
                {profile.bio || 'Aucune bio disponible'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Adresse */}
      <div className="grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2">
        <div className="flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--settings-ocre-soft)] text-[var(--ocre)]">
            <Map className="h-5 w-5" />
          </div>
          <div className="flex flex-col justify-center min-w-0">
            <p className="mb-0.5 text-[11px] font-medium text-[var(--chocolat-muted)]">Pays</p>
            <p className="text-sm font-semibold text-[var(--chocolat)]">République Démocratique du Congo</p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--settings-ocre-soft)] text-[var(--ocre)]">
            <MapPin className="h-5 w-5" />
          </div>
          <div className="flex flex-col justify-center min-w-0">
            <p className="mb-0.5 text-[11px] font-medium text-[var(--chocolat-muted)]">Ville / Province</p>
            <p className="text-sm font-semibold text-[var(--chocolat)]">Kinshasa</p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--settings-ocre-soft)] text-[var(--ocre)]">
            <Building className="h-5 w-5" />
          </div>
          <div className="flex flex-col justify-center min-w-0">
            <p className="mb-0.5 text-[11px] font-medium text-[var(--chocolat-muted)]">Quartier</p>
            {isEditing ? (
              <input
                type="text"
                value={formData.quartier || ''}
                onChange={(e) => handleInputChange('quartier', e.target.value)}
                className="text-sm font-semibold text-[var(--chocolat)] bg-transparent border-b border-[var(--settings-border)] focus:outline-none focus:border-[var(--ocre)]"
              />
            ) : (
              <p className="text-sm font-semibold text-[var(--chocolat)]">{profile.quartier || 'Non défini'}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}