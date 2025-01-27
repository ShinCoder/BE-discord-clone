import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { JWT_RT_STRATEGY_NAME } from '../constants';

@Injectable()
export class JwtRtGuard extends AuthGuard(JWT_RT_STRATEGY_NAME) {}
