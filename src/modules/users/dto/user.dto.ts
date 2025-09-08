import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';

export enum UserRole {
  ADMIN = 'ADMIN',
  REPRESENTANTE = 'REPRESENTANTE',
  VENDEDOR = 'VENDEDOR',
  USER = 'USER',
}

export class CreateUserDto {
  @IsString()
  nome: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsString()
  cpfCnpj?: string;

  @IsEnum(UserRole)
  papel: UserRole;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  nome?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @IsOptional()
  @IsString()
  cpfCnpj?: string;

  @IsOptional()
  @IsEnum(UserRole)
  papel?: UserRole;

  @IsOptional()
  twofaEnabled?: boolean;

  @IsOptional()
  @IsString()
  avatarPath?: string;
}