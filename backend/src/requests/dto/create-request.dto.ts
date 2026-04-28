import { IsString, IsUUID, IsOptional, MaxLength } from 'class-validator';

export class CreateRequestDto {
  @IsUUID()
  serviceId: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  message?: string;
}
