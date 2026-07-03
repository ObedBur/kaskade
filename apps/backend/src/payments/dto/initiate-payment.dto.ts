import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, Matches } from 'class-validator';

export enum PaymentOperator {
  AIRTEL = 'AIRTEL',
  ORANGE = 'ORANGE',
  MPESA = 'MPESA',
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
  @Matches(/^\+?243\d{9}$/, {
    message: 'Le numero doit etre au format congolais: +243XXXXXXXXX ou 243XXXXXXXXX',
  })
  phoneNumber: string;

  @IsEnum(PaymentOperator, {
    message: 'Operateur invalide. Valeurs acceptees: AIRTEL, ORANGE, MPESA, AFRICELL',
  })
  operator: PaymentOperator;

  @IsOptional()
  @IsEnum(PaymentCurrency, {
    message: 'Devise invalide. Valeurs acceptees: USD, CDF',
  })
  currency?: PaymentCurrency;
}
