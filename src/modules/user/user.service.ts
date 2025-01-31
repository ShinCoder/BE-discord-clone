import { Injectable, NotFoundException } from '@nestjs/common';
import { ConnectionStatus, RelationshipStatus } from '@prisma/client';

import { EConnectionStatus } from 'shared/types/api';
import { AccountSettings } from 'src/types/user.types';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async getMe(userId: string) {
    const { user, pinnedDms } = await this.prismaService.$transaction(
      async (tx) => {
        const account = await tx.accounts.findFirst({
          select: {
            id: true,
            email: true,
            username: true,
            displayName: true,
            dateOfBirth: true,
            phoneNumber: true,
            avatar: true,
            pronouns: true,
            bannerColor: true,
            about: true,
            createdAt: true,
            updatedAt: true,
            settings: true
          },
          where: { id: userId }
        });

        if (!account) {
          throw new NotFoundException();
        }

        const settings = new AccountSettings(account.settings);

        const pinnedAccounts = await tx.accounts.findMany({
          select: {
            id: true,
            email: true,
            username: true,
            displayName: true,
            dateOfBirth: true,
            phoneNumber: true,
            avatar: true,
            pronouns: true,
            bannerColor: true,
            about: true,
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
                connectionStatus: {
                  not: ConnectionStatus.OFFLINE
                }
              }
            }
          },
          where: {
            id: {
              in: settings.pinnedDms
            }
          }
        });

        const _pinnedDms: Array<{
          id: string;
          email: string;
          username: string;
          displayName: string;
          dateOfBirth: Date;
          phoneNumber: string;
          avatar: string;
          pronouns: string;
          bannerColor: string;
          about: string;
          createdAt: Date;
          updatedAt: Date;
          relationshipWith: Array<{
            accountId: string;
            targetId: string;
            status: RelationshipStatus;
            updatedAt: Date;
          }>;
          sessions: Array<{
            id: string;
            connectionStatus: ConnectionStatus;
          }>;
        }> = settings.pinnedDms.reduce((accum, e) => {
          const _e = pinnedAccounts.find((_account) => _account.id === e);

          if (_e) {
            return [...accum, e];
          } else {
            return accum;
          }
        }, []);

        return { user: account, pinnedDms: _pinnedDms };
      }
    );

    return {
      ...user,
      dateOfBirth: user.dateOfBirth.toISOString(),
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      settings: {
        dmSettings: {
          pinnedDms: pinnedDms.map((_e) => {
            const {
              dateOfBirth,
              createdAt,
              updatedAt,
              relationshipWith,
              sessions,
              ...rest
            } = _e;
            return {
              ...rest,
              dateOfBirth: dateOfBirth.toISOString(),
              createdAt: createdAt.toISOString(),
              updatedAt: updatedAt.toISOString(),
              inRelationshipWith:
                relationshipWith.length === 1
                  ? {
                      userId: relationshipWith[0].accountId,
                      targetId: relationshipWith[0].targetId,
                      status: EConnectionStatus[relationshipWith[0].status],
                      updatedAt: relationshipWith[0].updatedAt.toISOString()
                    }
                  : undefined,
              connectionStatus:
                sessions.length > 0
                  ? EConnectionStatus[sessions[0].connectionStatus]
                  : EConnectionStatus.OFFLINE
            };
          })
        }
      }
    };
  }
}
