import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AccountStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

import { CustomErrorCode, CustomErrorMessage } from 'shared/constants';
import { DefaultProfileValue } from 'src/constants';
import { CustomException } from 'src/exceptions';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { EJwtType, IJwtPayload } from 'src/types/auth.types';

import { RegisterDto } from './dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
    private readonly mailService: MailService
  ) {}

  private readonly saltRounds = 10;

  private signToken(type: EJwtType, accountId: string): string {
    let envType: string;
    switch (type) {
      case EJwtType.ACCESS:
        envType = 'AT';
        break;
      case EJwtType.REFRESH:
        envType = 'RT';
        break;
      case EJwtType.VERIFY:
        envType = 'VT';
        break;
      case EJwtType.RESET:
        envType = 'RST';
        break;
    }

    return this.jwtService.sign(
      { sub: accountId, type } satisfies IJwtPayload,
      {
        privateKey: this.configService.get<string>(`JWT_${envType}_SECRET`),
        expiresIn: this.configService.get<string>(`JWT_${envType}_EXPIRES`)
      }
    );
  }

  async register(data: RegisterDto) {
    const account = await this.prismaService.$transaction(async (tx) => {
      const existingAccount = await tx.accounts.findFirst({
        select: {
          id: true,
          email: true,
          username: true
        },
        where: {
          OR: [{ email: data.email }, { username: data.username }]
        }
      });

      if (existingAccount) {
        throw new CustomException(
          existingAccount.email === data.email
            ? CustomErrorMessage.REGISTER__EMAIL_EXISTS
            : CustomErrorMessage.REGISTER__USERNAME_EXISTS,
          HttpStatus.CONFLICT,
          existingAccount.email === data.email
            ? CustomErrorCode.REGISTER__EMAIL_EXISTS
            : CustomErrorCode.REGISTER__USERNAME_EXISTS
        );
      }

      const newAccount = await tx.accounts.create({
        data: {
          email: data.email,
          password: await bcrypt.hash(data.password, this.saltRounds),
          username: data.username,
          displayName: data.displayName || data.username,
          dateOfBirth: new Date(data.dateOfBirth),
          bannerColor: DefaultProfileValue.BannerColor,
          settings: {
            pinnedDms: []
          }
        }
      });

      return newAccount;
    });

    const verifyToken = this.signToken(EJwtType.VERIFY, account.id);

    await this.mailService.sendVerificationEmail({
      to: account.email,
      context: {
        name: data.username,
        verificationLink: `${this.configService.get<string>('WEBAPP_VERIFY_URL')}?token=${verifyToken}`
      }
    });
  }

  async verify(accountId: string) {
    await this.prismaService.$transaction(async (tx) => {
      const account = await tx.accounts.findFirst({
        select: {
          id: true,
          status: true
        },
        where: { id: accountId }
      });

      if (!account) {
        throw new CustomException(
          CustomErrorMessage.COMMON__ACCOUNT_NOT_FOUND,
          HttpStatus.NOT_FOUND,
          CustomErrorCode.COMMON__ACCOUNT_NOT_FOUND
        );
      }

      if (account.status !== AccountStatus.NOT_VERIFIED) {
        throw new CustomException(
          CustomErrorMessage.VERIFY__INVALID_STATUS,
          HttpStatus.CONFLICT,
          CustomErrorCode.VERIFY__INVALID_STATUS
        );
      }

      await tx.accounts.update({
        where: { id: accountId },
        data: { status: AccountStatus.ACTIVE }
      });
    });
  }
}
