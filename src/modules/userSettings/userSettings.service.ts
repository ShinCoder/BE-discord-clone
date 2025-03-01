import { HttpStatus, Injectable } from '@nestjs/common';
import { AccountStatus, ConnectionStatus } from '@prisma/client';

import { CustomErrorCode, CustomErrorMessage } from 'shared/constants';
import { EConnectionStatus, ERelationshipStatus } from 'shared/types/api';
import { CustomException } from 'src/exceptions';
import { AccountSettings } from 'src/types/user.types';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserSettingsService {
  constructor(private readonly prismaService: PrismaService) {}

  private verifySelfInvoke(id1: string, id2: string) {
    if (id1 === id2)
      throw new CustomException(
        CustomErrorMessage.COMMON__INVALID_SELF_INVOKE,
        HttpStatus.BAD_REQUEST,
        CustomErrorCode.COMMON__INVALID_SELF_INVOKE
      );
  }

  async pinDirectMessage(accountId: string, targetId: string) {
    this.verifySelfInvoke(accountId, targetId);

    const newPin = await this.prismaService.$transaction(async (tx) => {
      const account = await tx.accounts.findFirst({
        select: {
          id: true,
          settings: true
        },
        where: { id: accountId, status: AccountStatus.ACTIVE }
      });
      if (!account)
        throw new CustomException(
          CustomErrorMessage.COMMON__ACCOUNT_NOT_FOUND,
          HttpStatus.NOT_FOUND,
          CustomErrorCode.COMMON__ACCOUNT_NOT_FOUND
        );

      const settings = new AccountSettings(account.settings);

      if (settings.pinnedDms.includes(targetId))
        throw new CustomException(
          CustomErrorMessage.PIN_DM__ALREADY_PINNED,
          HttpStatus.CONFLICT,
          CustomErrorCode.PIN_DM__ALREADY_PINNED
        );

      const target = await tx.accounts.findFirst({
        select: {
          id: true,
          email: true,
          username: true,
          displayName: true,
          dateOfBirth: true,
          phoneNumber: true,
          avatar: true,
          about: true,
          pronouns: true,
          bannerColor: true,
          createdAt: true,
          updatedAt: true,
          relationshipWith: {
            select: {
              accountId: true,
              targetId: true,
              status: true,
              updatedAt: true
            },
            where: {
              accountId: account.id
            }
          },
          sessions: {
            select: {
              id: true,
              connectionStatus: true
            },
            where: {
              connectionStatus: ConnectionStatus.ONLINE
            }
          }
        },
        where: {
          id: targetId
        }
      });
      if (!target) {
        throw new CustomException(
          CustomErrorMessage.COMMON__TARGET_NOT_FOUND,
          HttpStatus.NOT_FOUND,
          CustomErrorCode.COMMON__TARGET_NOT_FOUND
        );
      }

      await tx.accounts.update({
        where: {
          id: account.id
        },
        data: {
          settings: {
            ...settings,
            pinnedDms: [target.id, ...settings.pinnedDms]
          }
        }
      });

      return target;
    });

    const {
      dateOfBirth,
      createdAt,
      updatedAt,
      relationshipWith,
      sessions,
      ...rest
    } = newPin;

    return {
      newPin: {
        ...rest,
        dateOfBirth: dateOfBirth.toISOString(),
        createdAt: createdAt.toISOString(),
        updatedAt: updatedAt.toISOString(),
        inRelationshipWith:
          relationshipWith.length === 1
            ? {
                userId: relationshipWith[0].accountId,
                targetId: relationshipWith[0].targetId,
                status: ERelationshipStatus[relationshipWith[0].status],
                updatedAt: relationshipWith[0].updatedAt.toISOString()
              }
            : undefined,
        connectionStatus:
          sessions.length > 0
            ? EConnectionStatus[sessions[0].connectionStatus]
            : EConnectionStatus.OFFLINE
      }
    };
  }

  async unpinDirectMessage(accountId: string, targetId: string) {
    await this.prismaService.$transaction(async (tx) => {
      const account = await tx.accounts.findFirst({
        select: {
          id: true,
          settings: true
        },
        where: { id: accountId, status: AccountStatus.ACTIVE }
      });
      if (!account)
        throw new CustomException(
          CustomErrorMessage.COMMON__ACCOUNT_NOT_FOUND,
          HttpStatus.NOT_FOUND,
          CustomErrorCode.COMMON__ACCOUNT_NOT_FOUND
        );

      const settings = new AccountSettings(account.settings);

      await tx.accounts.update({
        where: {
          id: account.id
        },
        data: {
          settings: {
            ...settings,
            pinnedDms: settings.pinnedDms.filter((e) => e !== targetId)
          }
        }
      });
    });
  }
}
