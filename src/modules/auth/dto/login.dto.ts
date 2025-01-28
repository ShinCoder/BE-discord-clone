import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

import { ILoginData } from 'shared/types/api';

export class LoginDto implements ILoginData {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
