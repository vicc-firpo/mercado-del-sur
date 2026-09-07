import { Inject, InjectionToken } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { faker } from '@faker-js/faker';
import { buildUser } from '../test/factories/user.factory';

jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: (entity: InjectionToken) => Inject(entity),
  getRepositoryToken: (entity: InjectionToken) => entity,
}));
import { CartService } from '../cart/cart.service';
import { CreateUserDto } from './dto/create-user.dto';
import { RoleName } from './enums/role-name.enum';
import { EmailAlreadyInUseException } from './exceptions/email-already-in-use.exception';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

type MockedUsersRepository = {
  create: jest.Mock;
  saveUnique: jest.Mock;
  findByEmailWithPassword: jest.Mock;
};

describe('UsersService', () => {
  let service: UsersService;
  let repository: MockedUsersRepository;
  let cartService: { createCartForUser: jest.Mock };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: {
            create: jest.fn(),
            saveUnique: jest.fn(),
            findByEmailWithPassword: jest.fn(),
          },
        },
        {
          provide: CartService,
          useValue: { createCartForUser: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(UsersService);
    repository = module.get<MockedUsersRepository>(UsersRepository);
    cartService = module.get(CartService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('creates a user with the customer role and returns its dto', async () => {
      const dto: CreateUserDto = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
      };
      const passwordHash = faker.internet.password();
      const created = buildUser({ ...dto, password: passwordHash });
      repository.create.mockReturnValue(created);
      repository.saveUnique.mockResolvedValue(created);

      const result = await service.create(dto, passwordHash);

      expect(repository.create).toHaveBeenCalledWith({
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        password: passwordHash,
        role: RoleName.CUSTOMER,
      });
      expect(repository.saveUnique).toHaveBeenCalledWith(created);
      expect(cartService.createCartForUser).toHaveBeenCalledWith(created.id);
      expect(result).toEqual({
        id: created.id,
        firstName: created.firstName,
        lastName: created.lastName,
        email: created.email,
        role: created.role,
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
      });
    });

    it('propagates EmailAlreadyInUseException from the repository', async () => {
      const dto: CreateUserDto = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
      };
      const created = buildUser(dto);
      repository.create.mockReturnValue(created);
      repository.saveUnique.mockRejectedValue(
        new EmailAlreadyInUseException(dto.email),
      );

      await expect(
        service.create(dto, faker.internet.password()),
      ).rejects.toThrow(EmailAlreadyInUseException);
      expect(cartService.createCartForUser).not.toHaveBeenCalled();
    });
  });

  describe('findByEmail', () => {
    it('delegates to the repository password-aware lookup', async () => {
      const user = buildUser();
      repository.findByEmailWithPassword.mockResolvedValue(user);

      const result = await service.findByEmail(user.email);

      expect(repository.findByEmailWithPassword).toHaveBeenCalledWith(
        user.email,
      );
      expect(result).toBe(user);
    });

    it('returns null when no user matches the email', async () => {
      repository.findByEmailWithPassword.mockResolvedValue(null);

      const result = await service.findByEmail(faker.internet.email());

      expect(result).toBeNull();
    });
  });
});
