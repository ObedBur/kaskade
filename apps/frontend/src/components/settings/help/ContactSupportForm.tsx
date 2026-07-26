"use client";

import { useState } from 'react';
import { useContactForm } from '@/hooks/useContactForm';
import {
  Loader2,
  Paperclip,
  CircleAlert,
  CheckCircle2,
  ChevronDown,
  X,
} from 'lucide-react';

const subjects = [
  "Problème de paiement",
  "Question sur un service",
  "Signaler un bug",
  "Problème de compte",
  "Autre",
];

export default function ContactSupportForm() {
  const { isSending, error, success, sendContactForm, setError, setSuccess } = useContactForm();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [showSubjects, setShowSubjects] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachment(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!subject || !message) {
      setError('Veuillez sélectionner un sujet et écrire un message.');
      return;
    }

    const result = await sendContactForm({ subject, message, attachment });
    if (result.success) {
      setSubject('');
      setMessage('');
      setAttachment(null);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-3">
        <p className="text-[11px] font-semibold text-[var(--chocolat-muted)]">Sujet</p>
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowSubjects(!showSubjects)}
            className="flex w-full items-center justify-between gap-3 rounded-xl border border-[color:var(--settings-border-strong)] bg-white px-4 py-3 text-left"
          >
            <span className={`text-sm font-semibold ${subject ? 'text-[var(--chocolat)]' : 'text-[var(--chocolat-muted)]'}`}>
              {subject || 'Sélectionnez un sujet'}
            </span>
            <ChevronDown className="h-4 w-4 text-[var(--chocolat-muted)]" />
          </button>
          {showSubjects && (
            <div className="absolute z-10 mt-1 w-full rounded-xl border border-[color:var(--settings-border-strong)] bg-white shadow-lg">
              {subjects.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setSubject(s);
                    setShowSubjects(false);
                  }}
                  className="block w-full px-4 py-2 text-left text-sm text-[var(--chocolat)] hover:bg-[var(--settings-hover)]"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-[11px] font-semibold text-[var(--chocolat-muted)]">Message</p>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Décrivez votre problème en donnant le plus de détails possible."
          className="min-h-[140px] w-full rounded-2xl border border-[color:var(--settings-border-strong)] bg-white px-4 py-4 text-sm text-[var(--chocolat)] outline-none focus:ring-2 focus:ring-[var(--ocre)]"
        />
      </div>

      <div className="space-y-3">
        <p className="text-[11px] font-semibold text-[var(--chocolat-muted)]">
          Capture d'écran (optionnel)
        </p>
        <label className="flex cursor-pointer items-center gap-4 rounded-2xl border border-dashed border-[color:var(--settings-border-strong)] bg-[#FCFAF7] px-5 py-5">
          <input type="file" className="hidden" onChange={handleFileChange} accept="image/png, image/jpeg, application/pdf" />
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[var(--chocolat-muted)] shadow-sm">
            <Paperclip className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--chocolat)] truncate">
              {attachment ? attachment.name : "Ajouter une capture d'écran"}
            </p>
            <p className="mt-1 text-xs text-[var(--chocolat-muted)]">
              {attachment
                ? `Taille: ${(attachment.size / 1024).toFixed(2)} Ko`
                : "PNG, JPG ou PDF - Max. 10 Mo"}
            </p>
          </div>
          {attachment && (
            <button 
              type="button"
              onClick={(e) => { e.preventDefault(); setAttachment(null); }}
              className="ml-auto text-[var(--chocolat-muted)] hover:text-red-500"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </label>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          <CircleAlert className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-3 rounded-xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>Votre message a été envoyé avec succès. Notre équipe vous répondra bientôt.</span>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSending}
          className="rounded-lg bg-[var(--ocre)] px-6 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-white transition-colors hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSending ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Envoi...</>
          ) : (
            'Envoyer le message'
          )}
        </button>
      </div>
    </form>
  );
}
