import { UsePipes, ValidationPipe } from '@nestjs/common';
import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
  WebSocketServer
} from '@nestjs/websockets';
import { Server } from 'socket.io';

import { SocketEvents } from 'shared/constants/socket';
import { EConnectionStatus } from 'shared/types/api';
import {
  IJoinDirectMessageRoomData,
  ILeaveDirectMessageRoomData,
  IReceiveDirectMessageDto,
  IReceiveFailedDirectMessageDto,
  ISendDirectMessageData
} from 'shared/types/socket';

import { Client, SocketWithAuth } from './gateway.type';
import { AuthService } from '../auth/auth.service';
import { DirectMessageService } from '../dm/dm.service';


@WebSocketGateway({ namespace: 'chat' })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private clients: Array<Client>;

  constructor(
    private readonly authService: AuthService,
    private readonly directMessageService: DirectMessageService
  ) {
    this.clients = [];
  }

  private addClient(client: Client) {
    this.clients.push(client);
  }

  private removeClient(client: Client) {
    this.clients.splice(
      this.clients.findIndex(
        (e) =>
          e.accountId === client.accountId && e.socketId === client.socketId
      ),
      1
    );
  }

  async handleConnection(client: SocketWithAuth) {
    const auth = client.auth;

    await this.authService.updateConnectionStatus({
      accountId: auth.sub,
      status: EConnectionStatus.ONLINE
    });

    this.addClient({ accountId: auth.sub, socketId: client.id });
  }

  async handleDisconnect(client: SocketWithAuth) {
    const auth = client.auth;

    await this.authService.updateConnectionStatus({
      accountId: auth.sub,
      status: EConnectionStatus.OFFLINE
    });

    this.removeClient({ accountId: auth.sub, socketId: client.id });
  }

  @SubscribeMessage(SocketEvents.joinDirectMessageRoom)
  async handleJoinDirectMessageRoom(
    @ConnectedSocket() client: SocketWithAuth,
    @MessageBody() data: IJoinDirectMessageRoomData
  ) {
    client.join([client.auth.sub, data.targetId].sort().join('-'));
  }

  @SubscribeMessage(SocketEvents.leaveDirectMessageRoom)
  handleLeaveDirectMessageRoom(
    @ConnectedSocket() client: SocketWithAuth,
    @MessageBody() data: ILeaveDirectMessageRoomData
  ) {
    client.leave([client.auth.sub, data.targetId].sort().join('-'));
  }

  @UsePipes(new ValidationPipe())
  @SubscribeMessage(SocketEvents.sendDirectMessage)
  async handleSendDirectMessage(
    @ConnectedSocket() client: SocketWithAuth,
    @MessageBody() data: ISendDirectMessageData
  ) {
    try {
      const message = await this.directMessageService.createDirectMessage({
        senderId: client.auth.sub,
        ...data
      });

      this.server
        .to([client.auth.sub, data.targetId].sort().join('-'))
        .emit(SocketEvents.receiveDirectMessage, {
          message: {
            ...message
          }
        } satisfies IReceiveDirectMessageDto);
    } catch (_) {
      console.log(_);
      client.emit(SocketEvents.receiveFailedDirectMessage, {
        message: {
          ...data,
          senderId: client.auth.sub,
          createdAt: new Date().toISOString()
        }
      } satisfies IReceiveFailedDirectMessageDto);
    }
  }
}
