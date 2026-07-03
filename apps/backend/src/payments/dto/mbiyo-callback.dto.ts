import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class MbiyoCallbackMetadataDto {
  @IsString()
  @IsOptional()
  country_code?: string;

  @IsString()
  @IsOptional()
  phone_number?: string;

  @IsString()
  @IsOptional()
  network?: string;

  @IsString()
  @IsOptional()
  om_otp?: string | null;
}

export class MbiyoCallbackDto {
  @IsString()
  @IsNotEmpty()
  transaction_id: string;

  @IsNumber()
  amount: number;

  @IsNumber()
  @IsOptional()
  fee?: number;

  @IsString()
  @IsNotEmpty()
  currency: string;

  @IsString()
  @IsNotEmpty()
  order_id: string;

  @IsString()
  @IsNotEmpty()
  status: string;

  @IsNumber()
  @IsOptional()
  charged_amount?: number;

  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  created_at?: string;

  @IsString()
  @IsOptional()
  updated_at?: string;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => MbiyoCallbackMetadataDto)
  metadata?: MbiyoCallbackMetadataDto;
}
