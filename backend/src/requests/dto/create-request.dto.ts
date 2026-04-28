import { IsString, IsNotEmpty, IsDateString, IsUUID, IsNumber, IsBoolean, IsOptional } from 'class-validator';

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
  @IsOptional()
  scheduleFrequency?: string;

  @IsString()
  @IsOptional()
  scheduleDay?: string;

  @IsString()
  @IsOptional()
  scheduleTime?: string;
}
