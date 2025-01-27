import { Request } from 'express';

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
