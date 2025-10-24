import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @IsEnum(['ADMIN', 'STAFF'], {
    message: 'Role must be one of the following values: ADMIN - STAFF',
  })
  @IsOptional()
  role?: 'ADMIN' | 'STAFF';

  @IsOptional()
  @IsString()
  imageURL?: string;
}
