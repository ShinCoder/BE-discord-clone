import { IsOptional, IsString } from 'class-validator';

import { ISendFriendRequestData } from 'shared/types/api';

export class SendFriendRequestDto implements ISendFriendRequestData {
  @IsString()
  @IsOptional()
  targetId?: string;

  @IsString()
  @IsOptional()
  targetUsername?: string;
}
