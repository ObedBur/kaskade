"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Cette page redirige automatiquement vers /dashboard/profil
 * pour conserver le layout dashboard (sidebar) lors de l'édition du profil.
 */
export default function PrestataireProfil() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/profil");
  }, [router]);

  return null;
}
