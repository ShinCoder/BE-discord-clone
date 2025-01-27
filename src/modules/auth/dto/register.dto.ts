import {
  IsNotEmpty,
  IsEmail,
  // IsStrongPassword,
  IsString,
  IsOptional,
  Validate,
  IsBoolean
} from 'class-validator';

import { IRegisterData } from 'shared/types/api/auth-api.types';
import { AgeRestrictConstraint, DateConstraint } from 'src/utils';

export class RegisterDto implements IRegisterData {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  // @IsStrongPassword({ minLength: 1 })
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsOptional()
  displayName?: string;

  @Validate(AgeRestrictConstraint)
  @Validate(DateConstraint)
  @IsString()
  @IsNotEmpty()
  dateOfBirth: string;

  @IsBoolean()
  @IsNotEmpty()
  emailSubscribe: boolean;
}
