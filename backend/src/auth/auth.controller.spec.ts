import { Inject, InjectionToken } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

jest.mock('@nestjs/jwt', () => ({
  JwtService: class JwtService {},
}));
jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: (entity: InjectionToken) => Inject(entity),
  getRepositoryToken: (entity: InjectionToken) => entity,
}));
import { faker } from '@faker-js/faker';
import { buildUser } from '../test/factories/user.factory';
import { UserDto } from '../users/dto/user.dto';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

type MockedAuthService = {
  register: jest.Mock;
  login: jest.Mock;
};

describe('AuthController', () => {
  let controller: AuthController;
  let authService: MockedAuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(AuthController);
    authService = module.get(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('delegates registration to the service', async () => {
      const dto: RegisterDto = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
      };
      const response: AuthResponseDto = {
        accessToken: faker.string.alphanumeric(32),
        user: UserDto.fromEntity(buildUser(dto)),
      };
      authService.register.mockResolvedValue(response);

      const result = await controller.register(dto);

      expect(authService.register).toHaveBeenCalledWith(dto);
      expect(result).toBe(response);
    });
  });

  describe('login', () => {
    it('delegates the login to the service', async () => {
      const dto: LoginDto = {
        email: faker.internet.email(),
        password: faker.internet.password(),
      };
      const response: AuthResponseDto = {
        accessToken: faker.string.alphanumeric(32),
        user: UserDto.fromEntity(buildUser({ email: dto.email })),
      };
      authService.login.mockResolvedValue(response);

      const result = await controller.login(dto);

      expect(authService.login).toHaveBeenCalledWith(dto);
      expect(result).toBe(response);
    });
  });

  describe('logout', () => {
    it('returns nothing', () => {
      expect(controller.logout()).toBeUndefined();
    });
  });
});
