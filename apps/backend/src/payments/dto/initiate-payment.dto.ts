import {
  IsUUID,
  IsNotEmpty,
  IsString,
  Matches,
  IsEnum,
  IsOptional,
} from 'class-validator';

/** Opérateurs mobile money RDC (Mbiyo Pay — country_code CD) */
export enum PaymentOperator {
  VODACOM = 'VODACOM',
  AIRTEL = 'AIRTEL',
  ORANGE = 'ORANGE',
  AFRICELL = 'AFRICELL',
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
    message:
      'Le numéro doit être au format congolais: +243XXXXXXXXX (9 chiffres après +243)',
  })
  phoneNumber: string;

  @IsEnum(PaymentOperator, {
    message:
      'Opérateur invalide. Valeurs acceptées: VODACOM, AIRTEL, ORANGE, AFRICELL',
  })
  operator: PaymentOperator;

  @IsOptional()
  @IsEnum(PaymentCurrency, {
    message: 'Devise invalide. Valeurs acceptées: USD, CDF',
  })
  currency?: PaymentCurrency;

  /** Code OTP opérateur (optionnel, certains réseaux) */
  @IsOptional()
  @IsString()
  omOtp?: string;
}
