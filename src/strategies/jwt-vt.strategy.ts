import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

import { EJwtType, IJwtPayload } from 'src/types/auth.types';

import { JWT_VT_STRATEGY_NAME } from '../constants';

@Injectable()
export class JwtVtStrategy extends PassportStrategy(
  Strategy,
  JWT_VT_STRATEGY_NAME
) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('verifyToken'),
      secretOrKey: configService.get<string>('JWT_VT_PUBLIC'),
      algorithms: ['RS256']
    });
  }

  async validate(payload: IJwtPayload) {
    if (payload.type !== EJwtType.VERIFY)
      throw new ForbiddenException('Invalid token');

    return payload;
  }
}
