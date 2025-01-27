import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { JWT_AT_STRATEGY_NAME } from '../constants';

@Injectable()
export class JwtAtGuard extends AuthGuard(JWT_AT_STRATEGY_NAME) {}
