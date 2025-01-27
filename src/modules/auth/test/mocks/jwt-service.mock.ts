import { mock_token } from './token.mock';

export const mockJwtService = {
  sign: jest.fn().mockReturnValue(mock_token)
};
