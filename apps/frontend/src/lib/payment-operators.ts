export type PaymentOperatorId =
  | "VODACOM"
  | "AIRTEL"
  | "ORANGE"
  | "AFRICELL";

export const MOBILE_MONEY_OPERATORS: {
  id: PaymentOperatorId;
  label: string;
  placeholder: string;
}[] = [
  { id: "VODACOM", label: "Vodacom", placeholder: "812345678" },
  { id: "AIRTEL", label: "Airtel", placeholder: "992345678" },
  { id: "ORANGE", label: "Orange", placeholder: "842345678" },
  { id: "AFRICELL", label: "Africell", placeholder: "902345678" },
];
