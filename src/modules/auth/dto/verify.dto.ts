import { IsNotEmpty, IsString } from 'class-validator';

import { IVerifyData } from 'shared/types/api';

export class VerifyDto implements IVerifyData {
  @IsString()
  @IsNotEmpty()
  verifyToken: string;
}
