export type IRegisterData = {
  email: string;
  password: string;
  username: string;
  displayName?: string;
  dateOfBirth: string;
  emailSubscribe: boolean;
};

export type ILoginData = {
  username: string;
  password: string;
};

export type ILoginResult = {
  accessToken: string;
  refreshToken: string;
};

export type IVerifyData = {
  verifyToken: string;
};
