export const CustomErrorCode = {
  COMMON__INVALID_DATA_FIELD: 40000,
  COMMON__ACCOUNT_NOT_FOUND: 40003,

  REGISTER__EMAIL_EXISTS: 40001,
  REGISTER__USERNAME_EXISTS: 40002,

  VERIFY__INVALID_STATUS: 40004,
};

export const CustomErrorMessage = {
  COMMON__ACCOUNT_NOT_FOUND: 'Account not found',

  REGISTER__AGE_RESTRICTION_VIOLATED: 'Age restriction violated',
  REGISTER__EMAIL_EXISTS: 'Email already exists',
  REGISTER__USERNAME_EXISTS: 'Username already exists',
  
  VERIFY__INVALID_STATUS: 'Invalid account status',
};