import {
  Controller,
  ForbiddenException,
  Get,
  Query,
  Req,
  UseGuards
} from '@nestjs/common';

import { IGetDirectMessagesResult } from 'shared/types/api';
import { JwtAtGuard } from 'src/guards';
import { IRequestWithUser } from 'src/types/auth.types';

import { DirectMessageService } from './dm.service';
import { GetDirectMessagesQuery } from './dto';

@Controller('direct-messages')
export class DirectMessageController {
  constructor(private readonly directMessageService: DirectMessageService) {}

  @UseGuards(JwtAtGuard)
  @Get()
  getDirectMessages(
    @Req() req: IRequestWithUser,
    @Query() query: GetDirectMessagesQuery
  ): Promise<IGetDirectMessagesResult> {
    if (req.user.sub !== query.senderId)
      throw new ForbiddenException('Forbidden resource');

    return this.directMessageService.getDirectMessages(query);
  }
}
