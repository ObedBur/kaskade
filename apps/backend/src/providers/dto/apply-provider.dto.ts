import { IsNotEmpty, IsString, IsOptional, MinLength } from 'class-validator';

export class ApplyProviderDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(20, { message: 'La motivation doit faire au moins 20 caractères' })
  motivation: string;

  @IsString()
  @IsNotEmpty()
  metier: string;

  @IsString()
  @IsNotEmpty()
  experience: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @IsString()
  @IsOptional()
  quartier?: string;
}
