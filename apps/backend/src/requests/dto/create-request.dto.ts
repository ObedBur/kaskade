import { IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';

export class CreateRequestDto {
  @IsString()
  @IsNotEmpty()
  serviceId: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsDateString()
  scheduledAt: string;

  // Planning premium (optionnel)
  @IsOptional()
  @IsString()
  scheduleFrequency?: string;

  @IsOptional()
  @IsString()
  scheduleDay?: string;

  @IsOptional()
  @IsString()
  scheduleTime?: string;
}
