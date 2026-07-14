import { IsNotEmpty, IsString, IsUUID, Length } from 'class-validator';

export class FinalizePaymentDto {
  @IsUUID()
  @IsNotEmpty()
  paymentId: string;

  @IsString()
  @IsNotEmpty()
  @Length(4, 8)
  otp: string;
}
