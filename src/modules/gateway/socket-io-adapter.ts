import { INestApplicationContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';

import { SocketWithAuth } from './gateway.type';
import { AuthService } from '../auth/auth.service';

export class SocketIOAdapter extends IoAdapter {
  constructor(
    private app: INestApplicationContext,
    private configService: ConfigService
  ) {
    super(app);
  }

  createIOServer(port: number, options?: ServerOptions) {
    const allowedOrigin = this.configService
      .get<string>('ALLOWED_ORIGIN')
      .split(',');

    const cors = {
      origin: allowedOrigin
    };

    const optionsWithCors: ServerOptions = {
      ...options,
      cors
    };

    const server = super.createIOServer(port, optionsWithCors);

    const authService = this.app.get<AuthService>(AuthService);

    server.of('chat').use(this.createAuthMiddleware(authService));

    return server;
  }

  private createAuthMiddleware =
    (authService: AuthService) => (socket: SocketWithAuth, next) => {
      const token =
        socket.handshake.auth.token || socket.handshake.headers['token'];

      try {
        const payload = authService.verifyAccessToken(token);
        socket.auth = {
          ...payload
        };
        next();
      } catch {
        next(new Error('Forbidden'));
      }
    };
}
