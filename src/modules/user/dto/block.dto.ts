import { IsNotEmpty, IsString } from 'class-validator';

import { IBlockData } from 'shared/types/api';

export class BlockDto implements IBlockData {
  @IsNotEmpty()
  @IsString()
  targetId: string;
}
