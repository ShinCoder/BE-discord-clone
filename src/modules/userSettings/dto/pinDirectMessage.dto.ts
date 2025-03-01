import { IsNotEmpty, IsString } from 'class-validator';

import { IPinDirectMessageData } from 'shared/types/api';

export class PinDirectMessageDto implements IPinDirectMessageData {
  @IsNotEmpty()
  @IsString()
  targetId: string;
}
