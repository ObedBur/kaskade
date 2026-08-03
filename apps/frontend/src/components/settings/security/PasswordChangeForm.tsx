"use client";

import { useState } from 'react';
import { useChangePassword } from '@/hooks/useChangePassword';
import { Eye, EyeOff, Loader2, CircleAlert, CheckCircle2, ShieldCheck } from 'lucide-react';

const passwordRequirements = [
  { id: "length",    text: "Minimum 8 caractères",          regex: /.{8,}/ },
  { id: "uppercase", text: "Une majuscule (A-Z)",            regex: /[A-Z]/ },
  { id: "lowercase", text: "Une minuscule (a-z)",            regex: /[a-z]/ },
  { id: "digit",     text: "Un chiffre (0-9)",               regex: /[0-9]/ },
  { id: "special",   text: "Un caractère spécial (!@#$%&*)", regex: /[!@#$%^&*]/ },
];

const strengthMeta = [
  { label: 'Très faible', color: 'bg-red-500',    text: 'text-red-500' },
  { label: 'Faible',      color: 'bg-orange-400', text: 'text-orange-400' },
  { label: 'Moyen',       color: 'bg-amber-400',  text: 'text-amber-400' },
  { label: 'Fort',        color: 'bg-lime-500',   text: 'text-lime-500' },
  { label: 'Très fort',   color: 'bg-green-500',  text: 'text-green-500' },
];

/* Champ mot de passe avec toggle visibilité */
function PasswordInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  hint,
  matchValue,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  matchValue?: string;
}) {
  const [show, setShow] = useState(false);
  const isMatch = matchValue !== undefined && value.length > 0 && value === matchValue;
  const isMismatch = matchValue !== undefined && value.length > 0 && value !== matchValue;

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-bold uppercase tracking-widest text-[var(--chocolat-muted)]">
        {label}
      </label>
      <div className="relative group">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-xl border bg-white px-4 py-3 pr-12 text-sm font-medium text-[var(--chocolat)] outline-none transition-all
            focus:ring-2 focus:ring-[var(--ocre)] focus:border-[var(--ocre)]
            ${isMismatch ? 'border-red-400 focus:ring-red-300' : ''}
            ${isMatch    ? 'border-green-400 focus:ring-green-300' : ''}
            ${!isMatch && !isMismatch ? 'border-[var(--settings-border-strong)]' : ''}
          `}
        />
        <button
          type="button"
          onClick={() => setShow(v => !v)}
          className="absolute inset-y-0 right-3 flex items-center text-[var(--chocolat-muted)] hover:text-[var(--chocolat)] transition-colors"
          aria-label={show ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {hint && <p className="text-[11px] text-[var(--chocolat-muted)]">{hint}</p>}
      {isMismatch && (
        <p className="text-[11px] text-red-500 font-medium">Les mots de passe ne correspondent pas</p>
      )}
      {isMatch && (
        <p className="text-[11px] text-green-600 font-medium flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" /> Les mots de passe correspondent
        </p>
      )}
    </div>
  );
}

export default function PasswordChangeForm() {
  const { isChanging, error, success, changePassword, setError, setSuccess } = useChangePassword();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [validatedRequirements, setValidatedRequirements] = useState<string[]>([]);

  const handlePasswordChange = (pass: string) => {
    setNewPassword(pass);
    let strength = 0;
    const validated: string[] = [];
    passwordRequirements.forEach(req => {
      if (req.regex.test(pass)) { strength++; validated.push(req.id); }
    });
    setPasswordStrength(strength);
    setValidatedRequirements(validated);
  };

  const strengthIndex = Math.min(passwordStrength, 4);
  const meta = strengthMeta[strengthIndex] || strengthMeta[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setError('Les nouveaux mots de passe ne correspondent pas.');
      return;
    }
    if (passwordStrength < passwordRequirements.length) {
      setError('Le nouveau mot de passe ne respecte pas toutes les exigences.');
      return;
    }

    const result = await changePassword({ oldPassword, newPassword });
    if (result.success) {
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordStrength(0);
      setValidatedRequirements([]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_260px]">
        
        {/* Champs de mot de passe */}
        <div className="space-y-5">
          <PasswordInput
            id="old-password"
            label="Mot de passe actuel"
            value={oldPassword}
            onChange={setOldPassword}
            placeholder="••••••••"
          />

          <PasswordInput
            id="new-password"
            label="Nouveau mot de passe"
            value={newPassword}
            onChange={handlePasswordChange}
            placeholder="••••••••"
          />

          {/* Barre de force */}
          {newPassword && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[var(--chocolat-muted)]">Force du mot de passe</span>
                <span className={`text-xs font-bold ${meta.text}`}>{meta.label}</span>
              </div>
              <div className="flex gap-1">
                {[0, 1, 2, 3, 4].map(i => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                      i < passwordStrength ? meta.color : 'bg-[var(--settings-hover)]'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          <PasswordInput
            id="confirm-password"
            label="Confirmer le nouveau mot de passe"
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder="••••••••"
            matchValue={newPassword}
          />
        </div>

        {/* Panel des exigences */}
        <div className="rounded-2xl border border-[var(--settings-border)] bg-[var(--off-white)] p-5 h-fit">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="h-4 w-4 text-[var(--ocre)]" />
            <p className="text-xs font-bold text-[var(--chocolat)]">Exigences de sécurité</p>
          </div>
          <div className="space-y-3">
            {passwordRequirements.map((req) => {
              const ok = validatedRequirements.includes(req.id);
              return (
                <div key={req.id} className="flex items-center gap-3">
                  <span className={`h-4 w-4 flex-shrink-0 rounded-full flex items-center justify-center transition-colors ${
                    ok ? 'bg-green-500' : 'border-2 border-[var(--settings-border-strong)]'
                  }`}>
                    {ok && (
                      <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 12 12">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </span>
                  <span className={`text-xs transition-colors ${ok ? 'text-green-700 font-medium' : 'text-[var(--chocolat-muted)]'}`}>
                    {req.text}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="space-y-3">
        {error && (
          <div className="flex items-center gap-3 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-xs font-semibold text-red-700">
            <CircleAlert className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="flex items-center gap-3 rounded-xl bg-green-50 border border-green-100 px-4 py-3 text-xs font-semibold text-green-700">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>Votre mot de passe a été mis à jour avec succès.</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
          <p className="text-[11px] text-[var(--chocolat-muted)] flex items-center gap-1.5">
            <CircleAlert className="h-3.5 w-3.5 text-[var(--ocre)]" />
            Vous serez déconnecté de tous vos autres appareils après la mise à jour.
          </p>
          <button
            type="submit"
            disabled={isChanging}
            className="shrink-0 rounded-xl bg-[var(--chocolat)] px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-white transition-all hover:bg-[var(--ocre)] disabled:opacity-50 flex items-center gap-2"
          >
            {isChanging ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Mise à jour...</>
            ) : (
              'Mettre à jour le mot de passe'
            )}
          </button>
        </div>
      </div>
    </form>
  );
}