import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { CreateUserDto } from './create-user.dto';
import { Status } from '@prisma/client';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsEnum(Status, { message: 'Le statut doit être DISPONIBLE, EN_MISSION ou INDISPONIBLE.' })
  @IsOptional()
  status?: Status;

  @IsBoolean()
  @IsOptional()
  isVerified?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isPremium?: boolean;
}
