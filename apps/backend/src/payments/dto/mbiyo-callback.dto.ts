import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, IsNumber, IsOptional, IsObject } from 'class-validator';

export class MbiyoCallbackDto {
  @IsString()
  @IsNotEmpty()
  transaction_id: string;

  @Type(() => Number)
  @IsNumber()
  amount: number;

  @IsOptional()
  @Type(() => Number)
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
  status: string;

  @IsOptional()
  @Type(() => Number)
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