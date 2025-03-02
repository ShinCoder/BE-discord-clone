import {
  Controller,
  Delete,
  ForbiddenException,
  HttpCode,
  HttpStatus,
  Param,
  Req,
  UseGuards
} from '@nestjs/common';

import { JwtAtGuard } from 'src/guards';
import { IRequestWithUser } from 'src/types/auth.types';

import { UserSettingsService } from './userSettings.service';

@Controller('users/:id/settings')
export class UserSettingsController {
  constructor(private readonly userSettingsService: UserSettingsService) {}

  private authenticateAccount(id: string, accountId: string) {
    if (id !== accountId) throw new ForbiddenException('Forbidden resource');
  }

  // @UseGuards(JwtAtGuard)
  // @Post('direct-message/pin')
  // async pinDirectMessage(
  //   @Req() req: IRequestWithUser,
  //   @Body() body: PinDirectMessageDto,
  //   @Param('id') accountId: string
  // ): Promise<IPinDirectMessageResult> {
  //   this.authenticateAccount(req.user.sub, accountId);

  //   return this.userSettingsService.pinDirectMessage(accountId, body.targetId);
  // }

  @UseGuards(JwtAtGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('direct-message/pin/:target')
  async unpinDirectMessage(
    @Req() req: IRequestWithUser,
    @Param('target') targetId: string,
    @Param('id') accountId: string
  ) {
    this.authenticateAccount(req.user.sub, accountId);

    return this.userSettingsService.unpinDirectMessage(accountId, targetId);
  }
}
