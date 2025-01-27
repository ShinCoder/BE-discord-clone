import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

import { EJwtType, IJwtPayload } from 'src/types/auth.types';

import { JWT_RT_STRATEGY_NAME } from '../constants';

@Injectable()
export class JwtRtStrategy extends PassportStrategy(
  Strategy,
  JWT_RT_STRATEGY_NAME
) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      secretOrKey: configService.get<string>('JWT_RT_PUBLIC'),
      algorithms: ['RS256']
    });
  }

  async validate(payload: IJwtPayload) {
    if (payload.type !== EJwtType.REFRESH)
      throw new ForbiddenException('Invalid token');

    return payload;
  }
}
