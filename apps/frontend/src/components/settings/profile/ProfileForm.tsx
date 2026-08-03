"use client";

import { useState, useEffect } from 'react';
import { useUserProfile, UpdateProfileData } from '@/hooks/useUserProfile';
import { UserRound, Phone, FileText, Map, MapPin, Building, Loader2, Edit3, Briefcase } from 'lucide-react';
import EditProfileModal from './EditProfileModal';

export default function ProfileForm() {
  const { profile, loading, error, isUpdating, updateProfile, uploadAvatar } = useUserProfile();
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const initialModalData: UpdateProfileData = {
    fullName: profile.fullName,
    phone: profile.phone,
    quartier: profile.quartier,
    bio: profile.bio || '',
  };

  return (
    <>
      {/* EDIT MODAL */}
      <EditProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={updateProfile}
        initialData={initialModalData}
      />

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 w-full">
        {/* LEFT COLUMN: Identity Card */}
        <div className="w-full lg:w-80 xl:w-96 shrink-0">
          <div className="relative overflow-hidden bg-white rounded-3xl shadow-xl shadow-[var(--chocolat)]/5 border border-white/50">
            {/* COVER IMAGE */}
            <div className="relative h-32 sm:h-40 lg:h-48 w-full bg-gradient-to-tr from-[var(--chocolat)] via-[#4a2e22] to-[var(--chocolat)] overflow-hidden">
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}></div>
              <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/10 blur-3xl"></div>
              <div className="absolute -left-10 -bottom-10 w-32 h-32 rounded-full bg-[var(--ocre)]/30 blur-2xl"></div>
            </div>

            {/* AVATAR */}
            <div className="relative px-6 pb-8">
              <div className="flex justify-center -mt-16 sm:-mt-20 lg:-mt-24 mb-4 relative z-10">
                <div className="relative shrink-0">
                  <div className="h-32 w-32 sm:h-36 sm:w-36 lg:h-44 lg:w-44 rounded-full border-[6px] lg:border-[8px] border-white bg-[var(--settings-ocre-soft)] text-[var(--ocre)] flex items-center justify-center overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
                    {profile.avatar ? (
                      <img src={profile.avatar} alt={displayName} className="h-full w-full object-cover" />
                    ) : (
                      <UserRound className="h-16 w-16 lg:h-20 lg:w-20" />
                    )}
                  </div>
                  {/* File Input for Avatar */}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="avatar-upload"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        await uploadAvatar(file);
                      }
                    }}
                  />
                  {/* Edit Avatar Button */}
                  <label
                    htmlFor="avatar-upload"
                    className="absolute bottom-1 right-1 lg:bottom-2 lg:right-2 bg-[var(--chocolat)] text-white p-3 lg:p-3.5 rounded-full border-4 border-white shadow-md hover:bg-[var(--ocre)] transition-colors cursor-pointer"
                  >
                    {isUpdating ? (
                      <Loader2 className="w-4 h-4 lg:w-5 lg:h-5 animate-spin" />
                    ) : (
                      <Edit3 className="w-4 h-4 lg:w-5 lg:h-5" />
                    )}
                  </label>
                </div>
              </div>

              {/* NAME & EMAIL */}
              <div className="text-center mb-8">
                <h2 className="text-2xl sm:text-3xl font-serif font-black text-[var(--chocolat)] tracking-tight">
                  {displayName}
                </h2>
                <p className="text-sm sm:text-base text-[var(--chocolat-muted)] tracking-wide mt-1.5">
                  {profile.email}
                </p>
              </div>

              {/* QUICK STATS */}
              <div className="flex justify-center gap-6 sm:gap-10 border-t border-[var(--settings-border)] pt-6">
                <div className="text-center">
                  <p className="text-base lg:text-lg font-black text-[var(--chocolat)] flex items-center gap-1.5 justify-center">
                    <Briefcase className="w-4 h-4 lg:w-5 lg:h-5 text-[var(--ocre)]"/>
                    <span className="capitalize">{profile.role.toLowerCase()}</span>
                  </p>
                  <p className="text-[10px] lg:text-xs text-[var(--chocolat-muted)] font-bold uppercase tracking-[0.2em] mt-1.5">Statut</p>
                </div>
                <div className="w-px h-10 bg-[var(--settings-border)]"></div>
                <div className="text-center">
                  <p className="text-base lg:text-lg font-black text-[var(--chocolat)] flex items-center gap-1 justify-center">
                    <span className="text-[var(--ocre)]">#</span>
                    {new Date(profile.createdAt || Date.now()).getFullYear()}
                  </p>
                  <p className="text-[10px] lg:text-xs text-[var(--chocolat-muted)] font-bold uppercase tracking-[0.2em] mt-1.5">Membre</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Details Section */}
        <div className="flex-1 min-w-0 bg-white sm:rounded-3xl shadow-xl shadow-[var(--chocolat)]/5 border border-white/50 p-6 sm:p-8 lg:p-10">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-[var(--settings-border)]">
            <h3 className="text-xs lg:text-sm font-bold text-[var(--ocre)] uppercase tracking-[0.2em]">
              Informations personnelles
            </h3>
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-[10px] lg:text-xs font-bold uppercase tracking-widest text-[var(--chocolat-muted)] hover:text-[var(--chocolat)] transition-colors flex items-center gap-2"
            >
              Modifier <Edit3 className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 lg:gap-x-12 gap-y-8 lg:gap-y-10">
            {/* Phone */}
            <div className="flex items-start gap-4">
              <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--settings-ocre-soft)] text-[var(--ocre)]">
                <Phone className="h-4 w-4 lg:h-5 lg:w-5" />
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <p className="text-[10px] lg:text-xs text-[var(--chocolat-muted)] font-bold uppercase tracking-wider mb-1">Téléphone</p>
                <p className="text-sm lg:text-base font-semibold text-[var(--chocolat)] truncate">{profile.phone || 'Non renseigné'}</p>
              </div>
            </div>

            {/* Country */}
            <div className="flex items-start gap-4">
              <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--settings-ocre-soft)] text-[var(--ocre)]">
                <Map className="h-4 w-4 lg:h-5 lg:w-5" />
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <p className="text-[10px] lg:text-xs text-[var(--chocolat-muted)] font-bold uppercase tracking-wider mb-1">Pays</p>
                <p className="text-sm lg:text-base font-semibold text-[var(--chocolat)] truncate">R.D. Congo</p>
              </div>
            </div>

            {/* City */}
            <div className="flex items-start gap-4">
              <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--settings-ocre-soft)] text-[var(--ocre)]">
                <Building className="h-4 w-4 lg:h-5 lg:w-5" />
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <p className="text-[10px] lg:text-xs text-[var(--chocolat-muted)] font-bold uppercase tracking-wider mb-1">Ville</p>
                <p className="text-sm lg:text-base font-semibold text-[var(--chocolat)] truncate">Kinshasa</p>
              </div>
            </div>

            {/* Neighborhood */}
            <div className="flex items-start gap-4">
              <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--settings-ocre-soft)] text-[var(--ocre)]">
                <MapPin className="h-4 w-4 lg:h-5 lg:w-5" />
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <p className="text-[10px] lg:text-xs text-[var(--chocolat-muted)] font-bold uppercase tracking-wider mb-1">Quartier</p>
                <p className="text-sm lg:text-base font-semibold text-[var(--chocolat)] truncate">{profile.quartier || 'Non défini'}</p>
              </div>
            </div>
          </div>

          {/* Bio (Full Width inside Right Column) */}
          <div className="mt-8 lg:mt-10 pt-8 lg:pt-10 border-t border-[var(--settings-border)]">
            <div className="flex items-start gap-4">
              <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--settings-ocre-soft)] text-[var(--ocre)]">
                <FileText className="h-4 w-4 lg:h-5 lg:w-5" />
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <p className="text-[10px] lg:text-xs text-[var(--chocolat-muted)] font-bold uppercase tracking-wider mb-2">Bio</p>
                <p className="text-sm lg:text-base font-medium text-[var(--chocolat-muted)] leading-relaxed">
                  {profile.bio || 'Aucune bio disponible. Cliquez sur le bouton modifier pour en ajouter une.'}
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}