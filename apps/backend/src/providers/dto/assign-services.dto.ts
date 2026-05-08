import { IsArray, IsUUID, IsNotEmpty } from 'class-validator';

export class AssignServicesDto {
  @IsArray()
  @IsUUID('4', { each: true })
  @IsNotEmpty()
  serviceIds: string[];
}
