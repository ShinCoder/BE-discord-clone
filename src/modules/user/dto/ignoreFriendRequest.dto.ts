import { IsNotEmpty, IsString } from 'class-validator';

import { IIgnoreFriendRequestData } from 'shared/types/api';

export class IgnoreFriendRequestDto implements IIgnoreFriendRequestData {
  @IsString()
  @IsNotEmpty()
  targetId: string;
}
