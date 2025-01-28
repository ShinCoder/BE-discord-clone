import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Req,
  UseGuards
} from '@nestjs/common';

import { ILoginResult } from 'shared/types/api';
import { JwtVtGuard } from 'src/guards';
import { IRequestWithUser } from 'src/types/auth.types';

import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, VerifyDto } from './dto';

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
}
