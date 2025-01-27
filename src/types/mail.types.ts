export type ISendEmailData = {
  to: string;
};

export type ISendVerificationEmailData = ISendEmailData & {
  context: {
    name: string;
    verificationLink: string;
  };
};
