import { Request } from 'express';

import { EConnectionStatus } from 'shared/types/api';

export enum EJwtType {
  ACCESS = 'Access',
  REFRESH = 'Refresh',
  VERIFY = 'Verify',
  RESET = 'Reset'
}

export type IJwtPayload = {
  sub: string;
  type: EJwtType;
};

export type IRequestWithUser = Request & { user: IJwtPayload };

export type IUpdateConnectionStatusData = {
  accountId: string;
  status: EConnectionStatus;
};
