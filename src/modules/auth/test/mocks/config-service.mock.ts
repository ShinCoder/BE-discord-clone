export const mockConfigService = {
  get: jest.fn().mockImplementation((key: string) => {
    switch (key) {
      case 'JWT_AT_SECRET':
        return 'secret';
      case 'JWT_AT_EXPIRES':
        return '1h';
      case 'JWT_RT_SECRET':
        return 'secret';
      case 'JWT_RT_EXPIRES':
        return '7d';
      case 'JWT_VT_SECRET':
        return 'secret';
      case 'JWT_VT_EXPIRES':
        return '1d';
      case 'JWT_RST_SECRET':
        return 'secret';
      case 'JWT_RST_EXPIRES':
        return '1h';
      case 'PORT':
        return 3000;
      default:
        return null;
    }
  })
};
