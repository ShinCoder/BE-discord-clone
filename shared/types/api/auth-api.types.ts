export type IRegisterData = {
  email: string;
  password: string;
  username: string;
  displayName?: string;
  dateOfBirth: string;
  emailSubscribe: boolean;
};

export type ILoginData = {
  email: string;
  password: string;
};

export type ITokenDto = {
  accessToken: string;
  refreshToken: string;
};

export type ILoginResult = ITokenDto;

export type IVerifyData = {
  verifyToken: string;
};

export type IRefreshData = {
  refreshToken: string;
};

export type IRefreshResult = ITokenDto;
