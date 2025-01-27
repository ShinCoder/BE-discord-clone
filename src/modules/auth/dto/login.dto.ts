import { IsNotEmpty, IsString } from 'class-validator';

import { ILoginData } from 'shared/types/api';

export class LoginDto implements ILoginData {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
