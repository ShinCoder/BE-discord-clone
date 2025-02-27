import { IsNotEmpty, IsString } from 'class-validator';

import { IAcceptFriendRequestData } from 'shared/types/api';

export class AcceptFriendRequestDto implements IAcceptFriendRequestData {
  @IsString()
  @IsNotEmpty()
  targetId: string;
}
