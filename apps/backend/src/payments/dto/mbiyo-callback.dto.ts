import { IsString, IsNotEmpty, IsNumber, IsOptional, IsObject } from 'class-validator';

/**
 * Payload webhook Mbiyo Pay (Merchant Payin).
 * @see https://dashboard.mbiyo.africa/docs/reference/merchant/payin
 */
export class MbiyoCallbackDto {
  @IsString()
  @IsNotEmpty()
  transaction_id: string;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsNumber()
  fee?: number;

  @IsString()
  @IsNotEmpty()
  currency: string;

  @IsString()
  @IsOptional()
  order_id?: string;

  @IsString()
  @IsNotEmpty()
  status: string; // pending | successful | failed | cancelled

  @IsOptional()
  @IsNumber()
  charged_amount?: number;

  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  created_at?: string;

  @IsString()
  @IsOptional()
  updated_at?: string;

  @IsOptional()
  @IsObject()
  metadata?: {
    country_code?: string;
    phone_number?: string;
    network?: string;
    om_otp?: string | null;
  };
}
