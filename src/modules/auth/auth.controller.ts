import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Put,
  Req,
  UseGuards
} from '@nestjs/common';

import { ILoginResult, IRefreshResult } from 'shared/types/api';
import { JwtAtGuard, JwtRtGuard, JwtVtGuard } from 'src/guards';
import { IRequestWithUser } from 'src/types/auth.types';

import { AuthService } from './auth.service';
import { LoginDto, RefreshDto, RegisterDto, VerifyDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  @UseGuards(JwtVtGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Patch('verify')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  verify(@Req() req: IRequestWithUser, @Body() body: VerifyDto) {
    return this.authService.verify(req.user.sub);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() body: LoginDto): Promise<ILoginResult> {
    return this.authService.login(body);
  }

  @UseGuards(JwtRtGuard)
  @Put('refresh')
  refresh(
    @Req() req: IRequestWithUser,
    @Body() body: RefreshDto
  ): Promise<IRefreshResult> {
    return this.authService.refresh(body, req.user.sub);
  }

  @UseGuards(JwtAtGuard)
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(@Req() req: IRequestWithUser) {
    return this.authService.logout(req.user.sub);
  }
}
