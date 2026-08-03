import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: "L'adresse email fournie n'est pas valide." })
  @IsNotEmpty({ message: "L'email est requis." })
  email: string;

  @IsString({ message: 'Le mot de passe doit être une chaîne de caractères.' })
  @IsNotEmpty({ message: 'Le mot de passe est obligatoire.' })
  password: string;

  @IsOptional()
  @IsBoolean({ message: "'Se souvenir de moi' doit être un booléen." })
  rememberMe?: boolean;
}
