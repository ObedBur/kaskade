"use client";

import { useState } from 'react';
import { useChangePassword } from '@/hooks/useChangePassword';
import { KeyRound, Loader2, CircleAlert, CheckCircle2 } from 'lucide-react';

const passwordRequirements = [
  { id: "length", text: "Minimum 8 caractères", regex: /.{8,}/ },
  { id: "uppercase", text: "Une majuscule (A-Z)", regex: /[A-Z]/ },
  { id: "lowercase", text: "Une minuscule (a-z)", regex: /[a-z]/ },
  { id: "digit", text: "Un chiffre (0-9)", regex: /[0-9]/ },
  { id: "special", text: "Un caractère spécial (!@#$%^&*)", regex: /[!@#$%^&*]/ },
];

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
      if (req.regex.test(pass)) {
        strength++;
        validated.push(req.id);
      }
    });

    setPasswordStrength(strength);
    setValidatedRequirements(validated);
  };

  const getStrengthStatus = () => {
    if (passwordStrength <= 2) return { text: 'Faible', color: 'text-red-500' };
    if (passwordStrength <= 4) return { text: 'Moyen', color: 'text-amber-500' };
    return { text: 'Fort', color: 'text-green-500' };
  };

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
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_280px]">
        <div className="space-y-5">
          {/* Mot de passe actuel - Le backend ne semble pas l'exiger, mais on le garde pour la forme */}
          <label className="block space-y-2">
            <span className="text-[11px] font-semibold text-[var(--chocolat-muted)]">
              Mot de passe actuel
            </span>
            <div className="relative">
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Entrez votre mot de passe actuel"
                className="w-full rounded-xl border border-[color:var(--settings-border-strong)] bg-white px-4 py-3 text-sm font-semibold text-[var(--chocolat)] outline-none focus:ring-2 focus:ring-[var(--ocre)]"
              />
              <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[var(--chocolat-muted)]">
                <KeyRound className="h-4 w-4" />
              </span>
            </div>
          </label>

          {/* Nouveau mot de passe */}
          <label className="block space-y-2">
            <span className="text-[11px] font-semibold text-[var(--chocolat-muted)]">
              Nouveau mot de passe
            </span>
            <div className="relative">
              <input
                type="password"
                value={newPassword}
                onChange={(e) => handlePasswordChange(e.target.value)}
                placeholder="Entrez votre nouveau mot de passe"
                className="w-full rounded-xl border border-[color:var(--settings-border-strong)] bg-white px-4 py-3 text-sm font-semibold text-[var(--chocolat)] outline-none focus:ring-2 focus:ring-[var(--ocre)]"
              />
              <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[var(--chocolat-muted)]">
                <KeyRound className="h-4 w-4" />
              </span>
            </div>
          </label>

          {/* Force du mot de passe */}
          {newPassword && (
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-4">
                <span className="text-[11px] font-semibold text-[var(--chocolat-muted)]">
                  Force du mot de passe :
                </span>
                <span className={`text-xs font-bold ${getStrengthStatus().color}`}>{getStrengthStatus().text}</span>
              </div>
              <div className="h-2 rounded-full bg-[var(--settings-hover)]">
                <div
                  className={`h-2 rounded-full transition-all ${getStrengthStatus().color.replace('text', 'bg')}`}
                  style={{ width: `${(passwordStrength / passwordRequirements.length) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Confirmer le mot de passe */}
          <label className="block space-y-2">
            <span className="text-[11px] font-semibold text-[var(--chocolat-muted)]">
              Confirmer le nouveau mot de passe
            </span>
            <div className="relative">
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirmez votre nouveau mot de passe"
                className="w-full rounded-xl border border-[color:var(--settings-border-strong)] bg-white px-4 py-3 text-sm font-semibold text-[var(--chocolat)] outline-none focus:ring-2 focus:ring-[var(--ocre)]"
              />
              <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[var(--chocolat-muted)]">
                <KeyRound className="h-4 w-4" />
              </span>
            </div>
          </label>
        </div>

        {/* Exigences */}
        <div className="rounded-2xl border border-[color:var(--settings-border)] bg-[var(--off-white)] p-5">
          <p className="text-xs font-bold text-[var(--chocolat)]">
            Exigences du mot de passe
          </p>
          <div className="mt-4 space-y-3">
            {passwordRequirements.map((req) => (
              <div
                key={req.id}
                className="flex items-center gap-3 text-xs text-[var(--chocolat-muted)]"
              >
                <span className={`h-3 w-3 rounded-full border transition-colors ${validatedRequirements.includes(req.id) ? 'bg-green-500 border-green-500' : 'border-[color:var(--settings-border-strong)]'}`} />
                <span>{req.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {error && (
          <div className="flex items-center gap-3 rounded-xl bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
            <CircleAlert className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="flex items-center gap-3 rounded-xl bg-green-50 px-4 py-3 text-xs font-semibold text-green-700">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>Votre mot de passe a été mis à jour avec succès.</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isChanging}
          className="self-end rounded-lg border border-[color:var(--settings-border-strong)] bg-[var(--ocre)] px-6 py-3 text-[11px] font-bold uppercase tracking-[0.22em] text-white transition-colors hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isChanging ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Mise à jour...</>
          ) : (
            'Mettre à jour le mot de passe'
          )}
        </button>

        <div className="flex items-center gap-3 rounded-xl bg-sky-50 px-4 py-3 text-xs font-semibold text-sky-700">
          <CircleAlert className="h-4 w-4 shrink-0" />
          <span>
            Après la mise à jour, vous serez déconnecté de tous les autres appareils.
          </span>
        </div>
      </div>
    </form>
  );
}