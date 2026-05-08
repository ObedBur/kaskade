import { IsString, IsNotEmpty, IsDateString, IsUUID, IsOptional, IsIn } from 'class-validator';

export class CreateRequestDto {
  @IsUUID()
  @IsNotEmpty()
  serviceId: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsDateString()
  @IsNotEmpty()
  scheduledAt: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  operator?: string;

  // Planning premium (optionnel)
  @IsString()
  @IsIn(['WEEKLY', 'MONTHLY'])
  @IsOptional()
  scheduleFrequency?: string;

  @IsString()
  @IsOptional()
  scheduleDay?: string;

  @IsString()
  @IsOptional()
  scheduleTime?: string;

  @IsDateString()
  @IsOptional()
  subscriptionEndsAt?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
