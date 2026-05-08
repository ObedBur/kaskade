import { IsUUID, IsNotEmpty, IsString, Matches, IsEnum, IsOptional } from 'class-validator';

export enum PaymentOperator {
  AIRTEL = 'AIRTEL',
  ORANGE = 'ORANGE',
  MPESA = 'MPESA',
}

export enum PaymentCurrency {
  USD = 'USD',
  CDF = 'CDF',
}

export class InitiatePaymentDto {
  @IsUUID()
  @IsNotEmpty()
  requestId: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\+243\d{9}$/, {
    message: 'Le numéro doit être au format congolais: +243XXXXXXXXX (9 chiffres après +243)',
  })
  phoneNumber: string;

  @IsEnum(PaymentOperator, {
    message: 'Opérateur invalide. Valeurs acceptées: AIRTEL, ORANGE, MPESA',
  })
  operator: PaymentOperator;

  @IsOptional()
  @IsEnum(PaymentCurrency, {
    message: 'Devise invalide. Valeurs acceptées: USD, CDF',
  })
  currency?: PaymentCurrency;
}
