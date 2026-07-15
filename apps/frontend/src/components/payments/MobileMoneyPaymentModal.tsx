"use client";

import DOMPurify from "dompurify";
import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Smartphone, X, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import api from "@/lib/api";
import {
  MOBILE_MONEY_OPERATORS,
  PaymentOperatorId,
} from "@/lib/payment-operators";

export type PaymentFlowType = "deposit" | "final";
export type PaymentCurrency = "USD" | "CDF";

interface MobileMoneyPaymentModalProps {
  requestId: string;
  amount: number;
  currency: PaymentCurrency;
  paymentType: PaymentFlowType;
  title?: string;
  onClose: () => void;
  onPaid: () => void;
}

export default function MobileMoneyPaymentModal({
  requestId,
  amount,
  currency,
  paymentType,
  title,
  onClose,
  onPaid,
}: MobileMoneyPaymentModalProps) {
  const [operator, setOperator] = useState<PaymentOperatorId | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [instructions, setInstructions] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<string | null>(null);
  const [phase, setPhase] = useState<
    | "INITIAL"
    | "INITIATING"
    | "WAITING_USSD"
    | "PIN_REQUIRED"
    | "PENDING_BACKGROUND"
    | "SUCCESS"
  >("INITIAL");
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(60);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const endpoint =
    paymentType === "deposit"
      ? "/payments/initiate/deposit"
      : "/payments/initiate/final";

  const formattedAmount =
    currency === "USD"
      ? `$${amount.toLocaleString("fr-CD", { maximumFractionDigits: 2 })}`
      : `${amount.toLocaleString("fr-CD", { maximumFractionDigits: 0 })} CDF`;

  const sanitizedInstructions = useMemo(() => {
    if (!instructions) {
      return null;
    }

    return DOMPurify.sanitize(instructions, {
      USE_PROFILES: { html: true },
    });
  }, [instructions]);

  const handlePay = async () => {
    const cleanPhone = phoneNumber.trim().replace(/\s/g, "");

    if (!operator) {
      toast.error("Veuillez choisir un opérateur.");
      return;
    }

    if (!/^[89][0-9]{8}$/.test(cleanPhone)) {
      toast.error("Veuillez entrer les 9 chiffres après le +243.");
      return;
    }

    setPhase("INITIATING");
    try {
      const res = await api.post(endpoint, {
        requestId,
        phoneNumber: `+243${cleanPhone}`,
        operator,
        currency,
      });

      setPaymentId(res.data.paymentId);

      if (res.data.redirectUrl) {
        window.location.href = res.data.redirectUrl;
        return;
      }

      if (res.data.authMode === "pin") {
        setAuthMode("pin");
        setPhase("PIN_REQUIRED");
        return;
      }

      if (res.data.instructions) {
        setInstructions(res.data.instructions);
      }

      setPhase("WAITING_USSD");
      setCountdown(60);
      toast.info("Confirmez le paiement sur votre téléphone.", {
        id: "mm-payment",
        duration: 60000,
      });
    } catch (err: any) {
      setPhase("INITIAL");
      toast.error(
        err.response?.data?.message ||
          "Erreur lors de l'initiation du paiement.",
      );
    }
  };

  const handleFinalizeOtp = async () => {
    if (!paymentId || !otp.trim()) {
      toast.error("Entrez le code PIN/OTP reçu.");
      return;
    }

    try {
      await api.post("/payments/finalize", { paymentId, otp: otp.trim() });
      setPhase("WAITING_USSD");
      setCountdown(60);
      toast.info("OTP transmis. Attendez la confirmation.", {
        id: "mm-payment",
      });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "OTP invalide.");
    }
  };

  useEffect(() => {
    if (phase !== "WAITING_USSD" || !paymentId) return;

    const handlePaymentSuccess = () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      toast.dismiss("mm-payment");
      setPhase("SUCCESS");
      setTimeout(onPaid, 1500);
    };

    const handlePaymentFailure = () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      toast.dismiss("mm-payment");
      setPhase("INITIAL");
      toast.error("Paiement échoué.");
    };

    const handleTimeoutStatusCheck = async () => {
      try {
        const res = await api.get(`/payments/status/${paymentId}`);
        if (res.data.status === "SUCCESS") {
          handlePaymentSuccess();
          return;
        }

        if (res.data.status === "FAILED") {
          handlePaymentFailure();
          return;
        }
      } catch {
        /* keep the payment protected if the final status cannot be confirmed */
      }

      toast.dismiss("mm-payment");
      setPhase("PENDING_BACKGROUND");
      toast.info(
        "Le paiement est toujours en cours de traitement, vous pouvez fermer cette fenêtre, nous vous notifierons.",
        { id: "mm-payment" },
      );
    };

    pollingRef.current = setInterval(async () => {
      try {
        const res = await api.get(`/payments/status/${paymentId}`);
        if (res.data.status === "SUCCESS") {
          handlePaymentSuccess();
        } else if (res.data.status === "FAILED") {
          handlePaymentFailure();
        }
      } catch {
        /* ignore polling errors */
      }
    }, 3000);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (pollingRef.current) clearInterval(pollingRef.current);
          void handleTimeoutStatusCheck();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [phase, paymentId, onPaid]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-chocolat/90 p-4 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="my-auto flex max-h-[95vh] w-full max-w-md flex-col overflow-hidden rounded-[24px] bg-white shadow-2xl"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-zinc-100 bg-[#FCFBF7] p-5">
          <div>
            <h3 className="text-lg font-black uppercase text-chocolat">
              {title ||
                (paymentType === "deposit"
                  ? "Paiement acompte 50%"
                  : "Paiement solde 50%")}
            </h3>
            <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-ocre">
              Sécurisé par Mbiyo Pay
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={phase === "WAITING_USSD"}
            className="rounded-full p-2 hover:bg-zinc-100 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-5 sm:p-6">
          <div className="mb-6 rounded-2xl bg-chocolat p-5 text-white">
            <p className="text-[9px] font-black uppercase tracking-widest text-white/50">
              Montant à payer
            </p>
            <p className="mt-1 text-4xl font-black">{formattedAmount}</p>
          </div>

          {phase === "SUCCESS" ? (
            <div className="flex flex-col items-center py-6 text-center">
              <CheckCircle className="mb-3 h-12 w-12 text-green-600" />
              <p className="text-sm font-black uppercase text-chocolat">
                Paiement réussi !
              </p>
            </div>
          ) : phase === "PENDING_BACKGROUND" ? (
            <div className="flex flex-col items-center py-6 text-center">
              <Loader2 className="mb-3 h-10 w-10 animate-spin text-ocre" />
              <p className="text-sm font-black uppercase text-chocolat">
                Paiement en cours
              </p>
              <p className="mt-3 max-w-xs text-sm font-bold leading-relaxed text-chocolat/60">
                Le paiement est toujours en cours de traitement. Vous pouvez
                fermer cette fenêtre, nous vous notifierons.
              </p>
            </div>
          ) : phase === "PIN_REQUIRED" ? (
            <div className="space-y-4">
              <p className="text-sm text-chocolat/70">
                Entrez le code PIN/OTP affiché sur votre téléphone.
              </p>
              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                maxLength={6}
                placeholder="123456"
                className="w-full rounded-xl border border-zinc-100 bg-off-white py-4 text-center text-lg font-bold tracking-widest outline-none focus:border-ocre"
              />
              <button
                onClick={handleFinalizeOtp}
                className="w-full rounded-2xl bg-chocolat py-4 text-[10px] font-black uppercase tracking-widest text-white"
              >
                Valider le code
              </button>
            </div>
          ) : (
            <>
              {sanitizedInstructions && (
                <div
                  className="prose prose-sm mb-4 max-w-none rounded-xl border border-ocre/20 bg-ocre/5 p-4 text-sm text-chocolat"
                  dangerouslySetInnerHTML={{ __html: sanitizedInstructions }}
                />
              )}

              <div className="mb-5 grid grid-cols-2 gap-2">
                {MOBILE_MONEY_OPERATORS.map((op) => (
                  <button
                    key={op.id}
                    onClick={() => setOperator(op.id)}
                    className={`rounded-xl border-2 px-3 py-3 text-[10px] font-black uppercase transition-all ${
                      operator === op.id
                        ? "border-ocre bg-ocre/10 text-ocre"
                        : "border-zinc-100 text-chocolat/60"
                    }`}
                  >
                    {op.label}
                  </button>
                ))}
              </div>

              <div className="relative mb-6">
                <div className="pointer-events-none absolute left-4 top-1/2 flex -translate-y-1/2 items-center gap-2 text-chocolat/50">
                  <Smartphone className="h-4 w-4" />
                  <span className="border-r border-zinc-200 pr-2 text-sm font-bold">
                    +243
                  </span>
                </div>
                <input
                  value={phoneNumber}
                  maxLength={9}
                  onChange={(e) =>
                    setPhoneNumber(e.target.value.replace(/\D/g, ""))
                  }
                  placeholder={
                    operator
                      ? MOBILE_MONEY_OPERATORS.find((o) => o.id === operator)
                          ?.placeholder
                      : "812345678"
                  }
                  className="w-full rounded-xl border border-zinc-100 bg-off-white py-4 pl-24 pr-4 text-sm font-bold tracking-widest outline-none focus:border-ocre"
                />
              </div>

              <button
                onClick={handlePay}
                disabled={phase !== "INITIAL"}
                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-chocolat py-5 text-[11px] font-black uppercase tracking-[0.2em] text-white disabled:opacity-50"
              >
                {phase === "INITIATING" && (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Initiation...
                  </>
                )}
                {phase === "WAITING_USSD" && (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Confirmez sur
                    téléphone ({countdown}s)
                  </>
                )}
                {phase === "INITIAL" && <>Payer maintenant</>}
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
