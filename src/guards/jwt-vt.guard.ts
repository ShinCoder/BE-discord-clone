import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { JWT_VT_STRATEGY_NAME } from '../constants';

@Injectable()
export class JwtVtGuard extends AuthGuard(JWT_VT_STRATEGY_NAME) {
  // constructor () {
  //     super();
  // }
}
