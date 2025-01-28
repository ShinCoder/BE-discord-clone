import { IsNotEmpty, IsString } from 'class-validator';

import { IRefreshData } from 'shared/types/api';

export class RefreshDto implements IRefreshData {
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
