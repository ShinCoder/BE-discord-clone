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
