import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

import { AuthModule } from 'src/modules/auth/auth.module';
import { JwtAtStrategy, JwtRtStrategy, JwtVtStrategy } from 'src/strategies';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DirectMessageModule } from '../dm/dm.module';
import { UserModule } from '../user/user.module';
import { UserSettingsModule } from '../userSettings/userSettings.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().default(3000),
        DATABASE_URL: Joi.string().required(),
        JWT_AT_SECRET: Joi.string().required(),
        JWT_RT_SECRET: Joi.string().required(),
        JWT_VT_SECRET: Joi.string().required(),
        JWT_AT_EXPIRES: Joi.string().required(),
        JWT_RT_EXPIRES: Joi.string().required(),
        JWT_VT_EXPIRES: Joi.string().required(),
        JWT_AT_PUBLIC: Joi.string().required(),
        JWT_RT_PUBLIC: Joi.string().required(),
        JWT_VT_PUBLIC: Joi.string().required(),
        MAIL_HOST: Joi.string().required(),
        MAIL_USER: Joi.string().required(),
        MAIL_PASS: Joi.string().required(),
        MAIL_FROM: Joi.string().required(),
        WEBAPP_BASE_URL: Joi.string().required(),
        WEBAPP_VERIFY_URL: Joi.string().required(),
        ALLOWED_ORIGIN: Joi.string().required()
      })
    }),
    AuthModule,
    UserModule,
    UserSettingsModule,
    DirectMessageModule
  ],
  controllers: [AppController],
  providers: [AppService, JwtAtStrategy, JwtRtStrategy, JwtVtStrategy]
})
export class AppModule {}
