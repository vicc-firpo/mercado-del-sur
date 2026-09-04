import { Inject, InjectionToken } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

jest.mock('@nestjs/jwt', () => ({
  JwtService: class JwtService {},
}));
jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: (entity: InjectionToken) => Inject(entity),
  getRepositoryToken: (entity: InjectionToken) => entity,
}));
import { JwtService } from '@nestjs/jwt';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';
import { buildUser } from '../test/factories/user.factory';
import { UserDto } from '../users/dto/user.dto';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { InvalidCredentialsException } from './exceptions/invalid-credentials.exception';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

type MockedUsersService = {
  create: jest.Mock;
  findByEmail: jest.Mock;
  findById: jest.Mock;
  updatePassword: jest.Mock;
};

type MockedJwtService = {
  sign: jest.Mock;
};

describe('AuthService', () => {
  let service: AuthService;
  let usersService: MockedUsersService;
  let jwtService: MockedJwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            findByEmail: jest.fn(),
            findById: jest.fn(),
            updatePassword: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('hashes the password, creates the user and returns a token', async () => {
      const dto: RegisterDto = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
      };
      const passwordHash = faker.internet.password();
      const user = UserDto.fromEntity(buildUser(dto));
      const token = faker.string.alphanumeric(32);
      (bcrypt.hash as jest.Mock).mockResolvedValue(passwordHash);
      usersService.create.mockResolvedValue(user);
      jwtService.sign.mockReturnValue(token);

      const result = await service.register(dto);

      expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, 10);
      expect(usersService.create).toHaveBeenCalledWith(dto, passwordHash);
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: user.id,
        email: user.email,
        role: user.role,
      });
      expect(result).toEqual({ accessToken: token, user });
    });
  });

  describe('login', () => {
    it('returns a token and the user dto when credentials are valid', async () => {
      const dto: LoginDto = {
        email: faker.internet.email(),
        password: faker.internet.password(),
      };
      const user = buildUser({ email: dto.email });
      const token = faker.string.alphanumeric(32);
      usersService.findByEmail.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.sign.mockReturnValue(token);

      const result = await service.login(dto);

      expect(usersService.findByEmail).toHaveBeenCalledWith(dto.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(dto.password, user.password);
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: user.id,
        email: user.email,
        role: user.role,
      });
      expect(result).toEqual({
        accessToken: token,
        user: UserDto.fromEntity(user),
      });
    });

    it('throws InvalidCredentialsException when the user does not exist', async () => {
      const dto: LoginDto = {
        email: faker.internet.email(),
        password: faker.internet.password(),
      };
      usersService.findByEmail.mockResolvedValue(null);

      await expect(service.login(dto)).rejects.toThrow(
        InvalidCredentialsException,
      );
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('throws InvalidCredentialsException when the password does not match', async () => {
      const dto: LoginDto = {
        email: faker.internet.email(),
        password: faker.internet.password(),
      };
      const user = buildUser({ email: dto.email });
      usersService.findByEmail.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(dto)).rejects.toThrow(
        InvalidCredentialsException,
      );
    });
  });

  describe('changePassword', () => {
    it('updates the password when the current password matches', async () => {
      const user = buildUser();
      const dto: ChangePasswordDto = {
        currentPassword: faker.internet.password(),
        newPassword: faker.internet.password(),
      };
      const newPasswordHash = faker.internet.password();
      usersService.findById.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue(newPasswordHash);

      await service.changePassword(user.id, dto);

      expect(usersService.findById).toHaveBeenCalledWith(user.id);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        dto.currentPassword,
        user.password,
      );
      expect(bcrypt.hash).toHaveBeenCalledWith(dto.newPassword, 10);
      expect(usersService.updatePassword).toHaveBeenCalledWith(
        user.id,
        newPasswordHash,
      );
    });

    it('throws InvalidCredentialsException when the current password does not match', async () => {
      const user = buildUser();
      const dto: ChangePasswordDto = {
        currentPassword: faker.internet.password(),
        newPassword: faker.internet.password(),
      };
      usersService.findById.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.changePassword(user.id, dto)).rejects.toThrow(
        InvalidCredentialsException,
      );
      expect(usersService.updatePassword).not.toHaveBeenCalled();
    });
  });
});
