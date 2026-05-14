import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

/**
 * DTO pour le callback (webhook) envoyé par Mbiyo Pay.
 * Structure basée sur la documentation Mbiyo Pay Collect API.
 */
export class MbiyoCallbackDto {
  @IsString()
  @IsNotEmpty()
  reference: string; // Référence Mbiyo Pay (correspond à mbiyoRef)

  @IsString()
  @IsNotEmpty()
  status: string; // SUCCESS | FAILED | CANCELLED

  @IsNumber()
  amount: number;

  @IsString()
  @IsNotEmpty()
  currency: string;

  @IsString()
  @IsOptional()
  operator?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  transactionId?: string; // ID de transaction de l'opérateur mobile
}
