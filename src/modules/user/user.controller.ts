import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards
} from '@nestjs/common';

import {
  IGetFriendRequestsResult,
  IGetFriendsResult,
  IGetMeResult
} from 'shared/types/api';
import { JwtAtGuard } from 'src/guards';
import { IRequestWithUser } from 'src/types/auth.types';

import {
  AcceptFriendRequestDto,
  IgnoreFriendRequestDto,
  SendFriendRequestDto
} from './dto';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAtGuard)
  @Get('me')
  getMe(@Req() req: IRequestWithUser): Promise<IGetMeResult> {
    return this.userService.getMe(req.user.sub);
  }

  @UseGuards(JwtAtGuard)
  @Get(':id/friends')
  getFriends(
    @Req() req: IRequestWithUser,
    @Param('id') accountId: string
  ): Promise<IGetFriendsResult> {
    if (req.user.sub !== accountId)
      throw new ForbiddenException('Forbidden resource');

    return this.userService.getFriends(accountId);
  }

  @UseGuards(JwtAtGuard)
  @Post(':id/friend-request')
  sendFriendRequest(
    @Req() req: IRequestWithUser,
    @Param('id') accountId: string,
    @Body() body: SendFriendRequestDto
  ) {
    if (req.user.sub !== accountId)
      throw new ForbiddenException('Forbidden resource');

    return this.userService.sendFriendRequest(accountId, body);
  }

  @UseGuards(JwtAtGuard)
  @Get(':id/friend-requests')
  getPendingFriendRequest(
    @Req() req: IRequestWithUser,
    @Param('id') accountId: string
  ): Promise<IGetFriendRequestsResult> {
    if (req.user.sub !== accountId)
      throw new ForbiddenException('Forbidden resource');

    return this.userService.getPendingFriendRequest(accountId);
  }

  @UseGuards(JwtAtGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Patch(':id/friend-request/accept')
  acceptFriendRequest(
    @Req() req: IRequestWithUser,
    @Param('id') accountId: string,
    @Body() body: AcceptFriendRequestDto
  ) {
    if (req.user.sub !== accountId)
      throw new ForbiddenException('Forbidden resource');

    return this.userService.feedbackFriendRequest(
      'accept',
      accountId,
      body.targetId
    );
  }

  @UseGuards(JwtAtGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Patch(':id/friend-request/ignore')
  ignoreFriendRequest(
    @Req() req: IRequestWithUser,
    @Param('id') accountId: string,
    @Body() body: IgnoreFriendRequestDto
  ) {
    if (req.user.sub !== accountId)
      throw new ForbiddenException('Forbidden resource');

    return this.userService.feedbackFriendRequest(
      'ignore',
      accountId,
      body.targetId
    );
  }

  @UseGuards(JwtAtGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id/friend-request/:target')
  cancelFriendRequest(
    @Req() req: IRequestWithUser,
    @Param('id') accountId: string,
    @Param('target') targetId: string
  ) {
    if (req.user.sub !== accountId)
      throw new ForbiddenException('Forbidden resource');

    return this.userService.cancelFriendRequest(accountId, targetId);
  }

  @UseGuards(JwtAtGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id/friend/:target')
  removeFriend(
    @Req() req: IRequestWithUser,
    @Param('id') accountId: string,
    @Param('target') targetId: string
  ) {
    if (req.user.sub !== accountId)
      throw new ForbiddenException('Forbidden resource');

    return this.userService.removeFriend(accountId, targetId);
  }
}
