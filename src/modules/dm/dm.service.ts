import { HttpStatus, Injectable } from '@nestjs/common';
import {
  AccountStatus,
  MessageTypes,
  Prisma,
  RelationshipStatus
} from '@prisma/client';

import { CustomErrorCode, CustomErrorMessage } from 'shared/constants';
import { EMessageType as APIMessageType } from 'shared/types/api';
import { CustomException } from 'src/exceptions';
import {
  EMessageType,
  ICreateDirectMessageData,
  ICreateDirectMessageResult
} from 'src/types/message.types';

import { GetDirectMessagesQuery } from './dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DirectMessageService {
  constructor(private readonly prismaService: PrismaService) {}

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

  async createDirectMessage(
    data: ICreateDirectMessageData
  ): Promise<ICreateDirectMessageResult> {
    const newMessage = await this.prismaService.$transaction(async (tx) => {
      const { target } = await this.verifyAccounts(
        tx,
        data.senderId,
        data.targetId
      );

      if (target.relationship[0]?.status === RelationshipStatus.BLOCKED)
        throw new CustomException(
          CustomErrorMessage.SEND_DM__BLOCKED,
          HttpStatus.FORBIDDEN,
          CustomErrorCode.SEND_DM__BLOCKED
        );

      const message = await tx.directMessages.create({
        data: {
          ...data,
          type: MessageTypes[data.type]
        }
      });

      return message;
    });

    return {
      ...newMessage,
      type: EMessageType[newMessage.type],
      createdAt: newMessage.createdAt.toISOString(),
      updatedAt: newMessage.updatedAt.toISOString()
    };
  }

  async getDirectMessages(data: GetDirectMessagesQuery) {
    const query = {
      where: {
        OR: [
          {
            senderId: data.senderId,
            targetId: data.targetId
          },
          {
            senderId: data.targetId,
            targetId: data.senderId
          }
        ]
      },
      take: data.take,
      skip: data.skip || (data.page ? data.take * (data.page - 1) : 0),
      orderBy: {
        createdAt: 'desc'
      }
    } satisfies Prisma.DirectMessagesFindManyArgs;

    const messages = await this.prismaService.$transaction(async (tx) => {
      return await tx.directMessages.findMany(query);
    });

    return {
      messages: messages.map((e) => ({
        ...e,
        type: APIMessageType[e.type],
        createdAt: e.createdAt.toISOString(),
        updatedAt: e.updatedAt.toISOString()
      }))
    };
  }
}
