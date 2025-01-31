import { Controller, Get, Req, UseGuards } from '@nestjs/common';

import { IGetMeResult } from 'shared/types/api';
import { JwtAtGuard } from 'src/guards';
import { IRequestWithUser } from 'src/types/auth.types';

import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAtGuard)
  @Get('me')
  getMe(@Req() req: IRequestWithUser): Promise<IGetMeResult> {
    return this.userService.getMe(req.user.sub);
  }
}
