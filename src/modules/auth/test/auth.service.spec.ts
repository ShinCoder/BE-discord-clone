import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { PrismaClient , Prisma } from '@prisma/client';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

import { PrismaService } from 'src/modules/prisma/prisma.service';

import { AuthService } from '../auth.service';
import { mockConfigService } from './mocks/config-service.mock';
import { mockJwtService } from './mocks/jwt-service.mock';
import { createUserStub } from './stubs/user.stub';

describe('AuthService', () => {
  let authService: AuthService;
  let prisma: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: ConfigService,
          useValue: mockConfigService
        },
        {
          provide: JwtService,
          useValue: mockJwtService
        },
        PrismaService
      ]
    })
      .overrideProvider(PrismaService)
      .useValue(mockDeep<PrismaService>())
      .compile();

    authService = moduleRef.get<AuthService>(AuthService);
    prisma = moduleRef.get(PrismaService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });
});
