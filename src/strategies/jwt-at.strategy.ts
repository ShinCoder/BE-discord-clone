import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { EJwtType, IJwtPayload } from 'src/types/auth.types';

import { JWT_AT_STRATEGY_NAME } from '../constants';

@Injectable()
export class JwtAtStrategy extends PassportStrategy(
  Strategy,
  JWT_AT_STRATEGY_NAME
) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_AT_PUBLIC'),
      algorithms: ['RS256']
    });
  }

  async validate(payload: IJwtPayload) {
    if (payload.type !== EJwtType.ACCESS)
      throw new ForbiddenException('Invalid token');

    return payload;
  }
}
