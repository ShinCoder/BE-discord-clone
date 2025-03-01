import { Socket } from 'socket.io';

import { IJwtPayload } from 'src/types/auth.types';

export type SocketWithAuth = Socket & {
  auth: IJwtPayload;
};

export type Client = {
  accountId: string;
  socketId: string;
};
