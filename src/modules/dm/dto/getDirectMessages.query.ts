import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min
} from 'class-validator';

import { IGetDirectMessagesQuery } from 'shared/types/api';

export class GetDirectMessagesQuery implements IGetDirectMessagesQuery {
  @IsString()
  @IsNotEmpty()
  senderId: string;

  @IsString()
  @IsNotEmpty()
  targetId: string;

  @Max(5000)
  @Min(1)
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  take = 5000;

  @Min(1)
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  skip?: number;
}
