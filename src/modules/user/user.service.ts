import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import {
  AccountStatus,
  ConnectionStatus,
  Prisma,
  RelationshipStatus
} from '@prisma/client';

import { CustomErrorCode, CustomErrorMessage } from 'shared/constants';
import { EConnectionStatus, ERelationshipStatus } from 'shared/types/api';
import { CustomException } from 'src/exceptions';
import { AccountSettings } from 'src/types/user.types';

import { SendFriendRequestDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  private verifySelfInvoke(id1: string, id2: string) {
    if (id1 === id2)
      throw new CustomException(
        CustomErrorMessage.COMMON__INVALID_SELF_INVOKE,
        HttpStatus.BAD_REQUEST,
        CustomErrorCode.COMMON__INVALID_SELF_INVOKE
      );
  }

  private async verifyAccounts(
    tx: Prisma.TransactionClient,
    accountId: string,
    targetId: string
  ) {
    const account = await tx.accounts.findFirst({
      select: {
        id: true,
        relationship: {
          select: {
            status: true
          },
          where: {
            targetId
          }
        }
      },
      where: { id: accountId, status: AccountStatus.ACTIVE }
    });
    if (!account)
      throw new CustomException(
        CustomErrorMessage.COMMON__ACCOUNT_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        CustomErrorCode.COMMON__ACCOUNT_NOT_FOUND
      );

    const target = await tx.accounts.findFirst({
      select: {
        id: true,
        relationship: {
          select: {
            status: true
          },
          where: {
            targetId: accountId
          }
        }
      },
      where: { id: targetId, status: AccountStatus.ACTIVE }
    });
    if (!target)
      throw new CustomException(
        CustomErrorMessage.COMMON__TARGET_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        CustomErrorCode.COMMON__TARGET_NOT_FOUND
      );

    return { account, target };
  }

  private async deleteBothRelationship(
    tx: Prisma.TransactionClient,
    accountId: string,
    targetId: string
  ) {
    await tx.relationships.delete({
      where: {
        accountId_targetId: {
          accountId,
          targetId
        }
      }
    });

    await tx.relationships.delete({
      where: {
        accountId_targetId: {
          accountId: targetId,
          targetId: accountId
        }
      }
    });
  }

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
            return [...accum, _e];
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
                      status: ERelationshipStatus[relationshipWith[0].status],
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

  async getFriends(accountId: string) {
    const users = await this.prismaService.$transaction(async (tx) => {
      const account = await tx.accounts.findFirst({
        select: {
          id: true
        },
        where: { id: accountId }
      });
      if (!account)
        throw new CustomException(
          CustomErrorMessage.COMMON__ACCOUNT_NOT_FOUND,
          HttpStatus.NOT_FOUND,
          CustomErrorCode.COMMON__ACCOUNT_NOT_FOUND
        );

      return await tx.accounts.findMany({
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
          status: AccountStatus.ACTIVE,
          relationshipWith: {
            some: {
              accountId: account.id,
              status: RelationshipStatus.FRIEND
            }
          }
        }
      });
    });

    return {
      friends: users.map((_user) => {
        const {
          dateOfBirth,
          createdAt,
          updatedAt,
          relationshipWith,
          sessions,
          ...rest
        } = _user;
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
                  status: ERelationshipStatus[_user.relationshipWith[0].status],
                  updatedAt: relationshipWith[0].updatedAt.toISOString()
                }
              : undefined,
          connectionStatus:
            sessions.length > 0
              ? EConnectionStatus[_user.sessions[0].connectionStatus]
              : EConnectionStatus.OFFLINE
        };
      })
    };
  }

  async sendFriendRequest(accountId: string, data: SendFriendRequestDto) {
    if (!data.targetId && !data.targetUsername) {
      throw new CustomException(
        CustomErrorMessage.COMMON__INVALID_DATA,
        HttpStatus.BAD_REQUEST,
        CustomErrorCode.SEND_FRIEND_REQUEST__NO_TARGET
      );
    }

    await this.prismaService.$transaction(async (tx) => {
      const account = await tx.accounts.findFirst({
        select: {
          id: true
        },
        where: { id: accountId }
      });
      if (!account)
        throw new CustomException(
          CustomErrorMessage.COMMON__ACCOUNT_NOT_FOUND,
          HttpStatus.NOT_FOUND,
          CustomErrorCode.COMMON__ACCOUNT_NOT_FOUND
        );

      const target = await tx.accounts.findFirst({
        select: {
          id: true,
          relationship: {
            select: {
              status: true
            },
            where: {
              targetId: account.id
            }
          }
        },
        where: {
          ...(data.targetId && { id: data.targetId }),
          ...(data.targetUsername && { username: data.targetUsername })
        }
      });
      if (!target)
        throw new CustomException(
          CustomErrorMessage.COMMON__TARGET_NOT_FOUND,
          HttpStatus.NOT_FOUND,
          CustomErrorCode.COMMON__TARGET_NOT_FOUND
        );

      if (account.id === target.id) {
        throw new CustomException(
          CustomErrorMessage.COMMON__INVALID_SELF_INVOKE,
          HttpStatus.BAD_REQUEST,
          CustomErrorCode.COMMON__INVALID_SELF_INVOKE
        );
      }

      if (target.relationship.length === 1) {
        switch (target.relationship[0].status) {
          case RelationshipStatus.FRIEND:
            throw new CustomException(
              CustomErrorMessage.SEND_FRIEND_REQUEST__ALREADY_FRIEND,
              HttpStatus.CONFLICT,
              CustomErrorCode.SEND_FRIEND_REQUEST__ALREADY_FRIEND
            );
          case RelationshipStatus.BLOCKED:
            throw new CustomException(
              CustomErrorMessage.SEND_FRIEND_REQUEST__BLOCKED,
              HttpStatus.CONFLICT,
              CustomErrorCode.SEND_FRIEND_REQUEST__BLOCKED
            );
          case RelationshipStatus.REQUESTING:
            await tx.relationships.update({
              where: {
                accountId_targetId: {
                  accountId: target.id,
                  targetId: account.id
                }
              },
              data: {
                status: RelationshipStatus.FRIEND
              }
            });
            await tx.relationships.upsert({
              where: {
                accountId_targetId: {
                  accountId: account.id,
                  targetId: target.id
                }
              },
              create: {
                account: {
                  connect: { id: account.id }
                },
                target: {
                  connect: { id: target.id }
                },
                status: RelationshipStatus.FRIEND
              },
              update: {
                status: RelationshipStatus.FRIEND
              }
            });
        }
      } else {
        await tx.relationships.upsert({
          where: {
            accountId_targetId: {
              accountId: account.id,
              targetId: target.id
            }
          },
          create: {
            account: {
              connect: { id: account.id }
            },
            target: {
              connect: { id: target.id }
            },
            status: RelationshipStatus.REQUESTING
          },
          update: {
            status: RelationshipStatus.REQUESTING
          }
        });

        await tx.relationships.create({
          data: {
            account: {
              connect: { id: target.id }
            },
            target: {
              connect: {
                id: account.id
              }
            },
            status: RelationshipStatus.PENDING
          }
        });
      }
    });
  }

  async getPendingFriendRequest(accountId: string) {
    const result = await this.prismaService.$transaction(async (tx) => {
      const account = await tx.accounts.findFirst({
        select: {
          id: true
        },
        where: { id: accountId }
      });
      if (!account)
        throw new CustomException(
          CustomErrorMessage.COMMON__ACCOUNT_NOT_FOUND,
          HttpStatus.NOT_FOUND,
          CustomErrorCode.COMMON__ACCOUNT_NOT_FOUND
        );

      const incomingRequests = await tx.accounts.findMany({
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
          }
        },
        where: {
          relationship: {
            some: {
              targetId: account.id,
              status: RelationshipStatus.REQUESTING
            }
          }
        }
      });

      const outgoingRequests = await tx.accounts.findMany({
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
          }
        },
        where: {
          relationship: {
            some: {
              targetId: account.id,
              status: RelationshipStatus.PENDING
            }
          }
        }
      });

      return { incomingRequests, outgoingRequests };
    });

    return {
      incomingRequests: result.incomingRequests.map((e) => {
        const { dateOfBirth, createdAt, updatedAt, relationshipWith, ...rest } =
          e;
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
                  status: ERelationshipStatus[relationshipWith[0].status],
                  updatedAt: relationshipWith[0].updatedAt.toISOString()
                }
              : undefined
        };
      }),
      outgoingRequests: result.outgoingRequests.map((e) => {
        const { dateOfBirth, createdAt, updatedAt, relationshipWith, ...rest } =
          e;
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
                  status: ERelationshipStatus[relationshipWith[0].status],
                  updatedAt: relationshipWith[0].updatedAt.toISOString()
                }
              : undefined
        };
      })
    };
  }

  async feedbackFriendRequest(
    type: 'accept' | 'ignore',
    accountId: string,
    targetId: string
  ) {
    this.verifySelfInvoke(accountId, targetId);

    await this.prismaService.$transaction(async (tx) => {
      const { account, target } = await this.verifyAccounts(
        tx,
        accountId,
        targetId
      );

      if (
        account.relationship[0]?.status === RelationshipStatus.PENDING &&
        target.relationship[0]?.status === RelationshipStatus.REQUESTING
      ) {
        if (type === 'accept') {
          await tx.relationships.update({
            where: {
              accountId_targetId: {
                accountId: account.id,
                targetId: target.id
              }
            },
            data: {
              status: RelationshipStatus.FRIEND
            }
          });

          await tx.relationships.update({
            where: {
              accountId_targetId: {
                accountId: target.id,
                targetId: account.id
              }
            },
            data: {
              status: RelationshipStatus.FRIEND
            }
          });
        } else {
          await this.deleteBothRelationship(tx, account.id, target.id);
        }
      } else {
        throw new CustomException(
          CustomErrorMessage.FRIEND_REQUEST_FEEDBACK__NO_REQUEST,
          HttpStatus.CONFLICT,
          CustomErrorCode.FRIEND_REQUEST_FEEDBACK__NO_REQUEST
        );
      }
    });
  }

  async cancelFriendRequest(accountId: string, targetId: string) {
    this.verifySelfInvoke(accountId, targetId);

    await this.prismaService.$transaction(async (tx) => {
      const { account, target } = await this.verifyAccounts(
        tx,
        accountId,
        targetId
      );

      if (
        account.relationship[0]?.status === RelationshipStatus.REQUESTING &&
        target.relationship[0]?.status === RelationshipStatus.PENDING
      ) {
        await this.deleteBothRelationship(tx, account.id, target.id);
      } else {
        throw new CustomException(
          CustomErrorMessage.FRIEND_REQUEST_FEEDBACK__NO_REQUEST,
          HttpStatus.CONFLICT,
          CustomErrorCode.FRIEND_REQUEST_FEEDBACK__NO_REQUEST
        );
      }
    });
  }

  async removeFriend(accountId: string, targetId: string) {
    this.verifySelfInvoke(accountId, targetId);

    await this.prismaService.$transaction(async (tx) => {
      const { account, target } = await this.verifyAccounts(
        tx,
        accountId,
        targetId
      );

      if (
        account.relationship[0]?.status === RelationshipStatus.FRIEND &&
        target.relationship[0]?.status === RelationshipStatus.FRIEND
      ) {
        await this.deleteBothRelationship(tx, account.id, target.id);
      } else {
        throw new CustomException(
          CustomErrorMessage.REMOVE_FRIEND__NOT_FRIEND,
          HttpStatus.CONFLICT,
          CustomErrorCode.REMOVE_FRIEND__NOT_FRIEND
        );
      }
    });
  }

  async getUserProfile(accountId: string, profileId: string) {
    const profile = await this.prismaService.accounts.findFirst({
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
            accountId
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
        id: profileId
      }
    });

    const {
      dateOfBirth,
      createdAt,
      updatedAt,
      relationshipWith,
      sessions,
      ...rest
    } = profile;
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
              status: ERelationshipStatus[relationshipWith[0].status],
              updatedAt: relationshipWith[0].updatedAt.toISOString()
            }
          : undefined,
      connectionStatus:
        sessions.length > 0
          ? EConnectionStatus[sessions[0].connectionStatus]
          : EConnectionStatus.OFFLINE
    };
  }

  async getBlockedUsers(accountId: string) {
    const users = await this.prismaService.$transaction(async (tx) => {
      const account = await tx.accounts.findFirst({
        select: {
          id: true
        },
        where: { id: accountId }
      });
      if (!account)
        throw new CustomException(
          CustomErrorMessage.COMMON__ACCOUNT_NOT_FOUND,
          HttpStatus.NOT_FOUND,
          CustomErrorCode.COMMON__ACCOUNT_NOT_FOUND
        );

      return await tx.accounts.findMany({
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
          }
        },
        where: {
          status: AccountStatus.ACTIVE,
          relationshipWith: {
            some: {
              accountId: account.id,
              status: RelationshipStatus.BLOCKED
            }
          }
        }
      });
    });

    return {
      blocked: users.map((_user) => {
        const { dateOfBirth, createdAt, updatedAt, relationshipWith, ...rest } =
          _user;
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
                  status: ERelationshipStatus[_user.relationshipWith[0].status],
                  updatedAt: relationshipWith[0].updatedAt.toISOString()
                }
              : undefined
        };
      })
    };
  }

  async blockUser(accountId: string, targetId: string) {
    this.verifySelfInvoke(accountId, targetId);

    await this.prismaService.$transaction(async (tx) => {
      const { account, target } = await this.verifyAccounts(
        tx,
        accountId,
        targetId
      );

      await tx.relationships.upsert({
        where: {
          accountId_targetId: {
            accountId: account.id,
            targetId: target.id
          }
        },
        update: {
          status: RelationshipStatus.BLOCKED
        },
        create: {
          account: {
            connect: {
              id: account.id
            }
          },
          target: {
            connect: {
              id: target.id
            }
          },
          status: RelationshipStatus.BLOCKED
        }
      });

      if (
        target.relationship[0]?.status &&
        target.relationship[0].status !== RelationshipStatus.BLOCKED
      ) {
        await tx.relationships.delete({
          where: {
            accountId_targetId: {
              accountId: target.id,
              targetId: account.id
            }
          }
        });
      }
    });
  }

  async unblockUser(accountId: string, targetId: string) {
    this.verifySelfInvoke(accountId, targetId);

    await this.prismaService.$transaction(async (tx) => {
      const { account, target } = await this.verifyAccounts(
        tx,
        accountId,
        targetId
      );

      if (account.relationship[0]?.status === RelationshipStatus.BLOCKED) {
        await tx.relationships.delete({
          where: {
            accountId_targetId: {
              accountId: account.id,
              targetId: target.id
            }
          }
        });
      } else {
        throw new CustomException(
          CustomErrorMessage.UNBLOCK__NOT_BLOCKED,
          HttpStatus.CONFLICT,
          CustomErrorCode.UNBLOCK__NOT_BLOCKED
        );
      }
    });
  }
}
