import { Inject, InjectionToken } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { faker } from '@faker-js/faker';
import { QueryFailedError } from 'typeorm';
import { buildUser } from '../test/factories/user.factory';

jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: (entity: InjectionToken) => Inject(entity),
  getRepositoryToken: (entity: InjectionToken) => entity,
}));
import { getRepositoryToken } from '@nestjs/typeorm';
import { CartService } from '../cart/cart.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RoleName } from './enums/role-name.enum';
import { User } from './entities/user.entity';
import { EmailAlreadyInUseException } from './exceptions/email-already-in-use.exception';
import { UserNotFoundException } from './exceptions/user-not-found.exception';
import { UsersService } from './users.service';

function buildUniqueViolationError(): QueryFailedError {
  const error = new QueryFailedError('', [], new Error('duplicate key'));
  (error as unknown as { driverError: { code: string } }).driverError = {
    code: '23505',
  };
  return error;
}

type MockedUserRepository = {
  create: jest.Mock;
  save: jest.Mock;
  find: jest.Mock;
  findOne: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
  createQueryBuilder: jest.Mock;
};

describe('UsersService', () => {
  let service: UsersService;
  let repository: MockedUserRepository;
  let cartService: { createCartForUser: jest.Mock };
  let queryBuilder: {
    addSelect: jest.Mock;
    where: jest.Mock;
    getOne: jest.Mock;
  };

  beforeEach(async () => {
    queryBuilder = {
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
          },
        },
        {
          provide: CartService,
          useValue: { createCartForUser: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(UsersService);
    repository = module.get<MockedUserRepository>(getRepositoryToken(User));
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
      repository.save.mockResolvedValue(created);

      const result = await service.create(dto, passwordHash);

      expect(repository.create).toHaveBeenCalledWith({
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        password: passwordHash,
        role: RoleName.CUSTOMER,
      });
      expect(repository.save).toHaveBeenCalledWith(created);
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

    it('throws EmailAlreadyInUseException when the email is already taken', async () => {
      const dto: CreateUserDto = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
      };
      const created = buildUser(dto);
      repository.create.mockReturnValue(created);
      repository.save.mockRejectedValue(buildUniqueViolationError());

      await expect(
        service.create(dto, faker.internet.password()),
      ).rejects.toThrow(EmailAlreadyInUseException);
      expect(cartService.createCartForUser).not.toHaveBeenCalled();
    });
  });

  describe('findByEmail', () => {
    it('queries with the password column selected', async () => {
      const user = buildUser();
      queryBuilder.getOne.mockResolvedValue(user);

      const result = await service.findByEmail(user.email);

      expect(repository.createQueryBuilder).toHaveBeenCalledWith('user');
      expect(queryBuilder.addSelect).toHaveBeenCalledWith('user.password');
      expect(queryBuilder.where).toHaveBeenCalledWith('user.email = :email', {
        email: user.email,
      });
      expect(result).toBe(user);
    });

    it('returns null when no user matches the email', async () => {
      queryBuilder.getOne.mockResolvedValue(null);

      const result = await service.findByEmail(faker.internet.email());

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('returns the user when found', async () => {
      const user = buildUser();
      queryBuilder.getOne.mockResolvedValue(user);

      const result = await service.findById(user.id);

      expect(queryBuilder.where).toHaveBeenCalledWith('user.id = :id', {
        id: user.id,
      });
      expect(result).toBe(user);
    });

    it('throws UserNotFoundException when not found', async () => {
      queryBuilder.getOne.mockResolvedValue(null);
      const id = faker.string.uuid();

      await expect(service.findById(id)).rejects.toThrow(UserNotFoundException);
    });
  });

  describe('updatePassword', () => {
    it('updates the password when the user exists', async () => {
      const id = faker.string.uuid();
      const passwordHash = faker.internet.password();
      repository.update.mockResolvedValue({ affected: 1 });

      await service.updatePassword(id, passwordHash);

      expect(repository.update).toHaveBeenCalledWith(id, {
        password: passwordHash,
      });
    });

    it('throws UserNotFoundException when no rows are affected', async () => {
      repository.update.mockResolvedValue({ affected: 0 });

      await expect(
        service.updatePassword(faker.string.uuid(), faker.internet.password()),
      ).rejects.toThrow(UserNotFoundException);
    });
  });

  describe('findAll', () => {
    it('returns all users ordered by creation date as dtos', async () => {
      const users = [buildUser(), buildUser()];
      repository.find.mockResolvedValue(users);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalledWith({
        order: { createdAt: 'ASC' },
      });
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(
        expect.objectContaining({ id: users[0].id, email: users[0].email }),
      );
    });
  });

  describe('findOne', () => {
    it('returns the user dto when found', async () => {
      const user = buildUser();
      repository.findOne.mockResolvedValue(user);

      const result = await service.findOne(user.id);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: user.id },
      });
      expect(result).toEqual(
        expect.objectContaining({ id: user.id, email: user.email }),
      );
    });

    it('throws UserNotFoundException when not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne(faker.string.uuid())).rejects.toThrow(
        UserNotFoundException,
      );
    });
  });

  describe('update', () => {
    it('merges the dto into the user and saves it', async () => {
      const user = buildUser();
      const dto: UpdateUserDto = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
      };
      repository.findOne.mockResolvedValue(user);
      repository.save.mockResolvedValue({ ...user, ...dto });

      const result = await service.update(user.id, dto);

      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining(dto),
      );
      expect(result).toEqual(expect.objectContaining(dto));
    });

    it('throws UserNotFoundException when the user does not exist', async () => {
      repository.findOne.mockResolvedValue(null);
      const dto: UpdateUserDto = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
      };

      await expect(service.update(faker.string.uuid(), dto)).rejects.toThrow(
        UserNotFoundException,
      );
    });

    it('throws EmailAlreadyInUseException when the new email is taken', async () => {
      const user = buildUser();
      const dto: UpdateUserDto = {
        firstName: user.firstName,
        lastName: user.lastName,
        email: faker.internet.email(),
      };
      repository.findOne.mockResolvedValue(user);
      repository.save.mockRejectedValue(buildUniqueViolationError());

      await expect(service.update(user.id, dto)).rejects.toThrow(
        EmailAlreadyInUseException,
      );
    });
  });

  describe('delete', () => {
    it('deletes the user when it exists', async () => {
      const id = faker.string.uuid();
      repository.delete.mockResolvedValue({ affected: 1 });

      await service.delete(id);

      expect(repository.delete).toHaveBeenCalledWith(id);
    });

    it('throws UserNotFoundException when no rows are affected', async () => {
      repository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.delete(faker.string.uuid())).rejects.toThrow(
        UserNotFoundException,
      );
    });
  });
});
