import { PaymentOperator } from './dto/initiate-payment.dto';

/** Réseaux mobile money RDC supportés par Mbiyo Pay (country_code: CD) */
export const MBIYO_NETWORK_MAP: Record<PaymentOperator, string> = {
  VODACOM: 'vodacom',
  AIRTEL: 'airtel',
  ORANGE: 'orange',
  AFRICELL: 'africell',
};

export function mapOperatorToNetwork(operator: PaymentOperator): string {
  return MBIYO_NETWORK_MAP[operator];
}

export function isMbiyoPaymentSuccessful(status: string): boolean {
  const normalized = status.toLowerCase();
  return normalized === 'successful' || normalized === 'success';
}

export function isMbiyoPaymentFailed(status: string): boolean {
  const normalized = status.toLowerCase();
  return normalized === 'failed' || normalized === 'cancelled';
}

export interface MbiyoPayinResponse {
  status: string;
  message: string;
  data?: {
    transaction_id: string;
    amount: number;
    fee?: number;
    charged_amount?: number;
    currency: string;
    order_id?: string;
    status: string;
    payment_method?: string;
    redirect_url?: string | null;
    instructions?: string | null;
    auth_mode?: string | null;
    created_at?: string;
  };
}
