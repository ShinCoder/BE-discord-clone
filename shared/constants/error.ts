export const CustomErrorCode = {
  COMMON__INVALID_DATA_FIELD: 40000,

  LOGIN__ACCOUNT_NOT_VERIFIED: 40300,

  COMMON__ACCOUNT_NOT_FOUND: 40400,

  REGISTER__EMAIL_EXISTS: 40900,
  REGISTER__USERNAME_EXISTS: 40901,
  VERIFY__INVALID_STATUS: 40902
};

export const CustomErrorMessage = {
  COMMON__ACCOUNT_NOT_FOUND: 'Account not found',

  LOGIN__ACCOUNT_NOT_VERIFIED: 'Account not verified',

  REGISTER__AGE_RESTRICTION_VIOLATED: 'Age restriction violated',
  REGISTER__EMAIL_EXISTS: 'Email already exists',
  REGISTER__USERNAME_EXISTS: 'Username already exists',

  VERIFY__INVALID_STATUS: 'Invalid account status'
};
