import { IsUUID, IsNotEmpty } from 'class-validator';

export class MockPaymentDto {
  @IsUUID()
  @IsNotEmpty()
  requestId: string;
}
