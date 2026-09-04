import { Inject, InjectionToken } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { faker } from '@faker-js/faker';
import { buildUser } from '../test/factories/user.factory';

jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: (entity: InjectionToken) => Inject(entity),
  getRepositoryToken: (entity: InjectionToken) => entity,
}));
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

type MockedUsersService = {
  findAll: jest.Mock;
  findOne: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
};

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: MockedUsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(UsersController);
    usersService = module.get<MockedUsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('returns the users returned by the service', async () => {
      const users = [
        UserDto.fromEntity(buildUser()),
        UserDto.fromEntity(buildUser()),
      ];
      usersService.findAll.mockResolvedValue(users);

      const result = await controller.findAll();

      expect(usersService.findAll).toHaveBeenCalled();
      expect(result).toBe(users);
    });
  });

  describe('findOne', () => {
    it('returns the user returned by the service', async () => {
      const user = UserDto.fromEntity(buildUser());
      usersService.findOne.mockResolvedValue(user);

      const result = await controller.findOne(user.id);

      expect(usersService.findOne).toHaveBeenCalledWith(user.id);
      expect(result).toBe(user);
    });
  });

  describe('update', () => {
    it('delegates the update to the service', async () => {
      const id = faker.string.uuid();
      const dto: UpdateUserDto = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
      };
      const updated = UserDto.fromEntity(buildUser({ id, ...dto }));
      usersService.update.mockResolvedValue(updated);

      const result = await controller.update(id, dto);

      expect(usersService.update).toHaveBeenCalledWith(id, dto);
      expect(result).toBe(updated);
    });
  });

  describe('delete', () => {
    it('delegates the deletion to the service', async () => {
      const id = faker.string.uuid();
      usersService.delete.mockResolvedValue(undefined);

      await controller.delete(id);

      expect(usersService.delete).toHaveBeenCalledWith(id);
    });
  });
});
