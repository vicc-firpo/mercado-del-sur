import { DataSource, QueryFailedError, SelectQueryBuilder } from 'typeorm';
import { faker } from '@faker-js/faker';
import { buildUser } from '../test/factories/user.factory';
import { User } from './entities/user.entity';
import { EmailAlreadyInUseException } from './exceptions/email-already-in-use.exception';
import { UsersRepository } from './users.repository';

const stubDataSource = {
  createEntityManager: () => ({}),
} as unknown as DataSource;

function buildUniqueViolationError(): QueryFailedError {
  const error = new QueryFailedError('', [], new Error('duplicate key'));
  (error as unknown as { driverError: { code: string } }).driverError = {
    code: '23505',
  };
  return error;
}

type QueryBuilderMock = {
  addSelect: jest.Mock;
  where: jest.Mock;
  getOne: jest.Mock;
};

describe('UsersRepository', () => {
  let repository: UsersRepository;
  let queryBuilder: QueryBuilderMock;
  let createQueryBuilder: jest.SpyInstance;

  beforeEach(() => {
    repository = new UsersRepository(stubDataSource);
    queryBuilder = {
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(null),
    };
    createQueryBuilder = jest
      .spyOn(repository, 'createQueryBuilder')
      .mockReturnValue(queryBuilder as unknown as SelectQueryBuilder<User>);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('findByEmailWithPassword', () => {
    it('selects the hidden password column and filters by email', async () => {
      const user = buildUser();
      queryBuilder.getOne.mockResolvedValue(user);

      await expect(
        repository.findByEmailWithPassword(user.email),
      ).resolves.toBe(user);
      expect(createQueryBuilder).toHaveBeenCalledWith('user');
      expect(queryBuilder.addSelect).toHaveBeenCalledWith('user.password');
      expect(queryBuilder.where).toHaveBeenCalledWith('user.email = :email', {
        email: user.email,
      });
    });
  });

  describe('findByIdWithPassword', () => {
    it('selects the hidden password column and filters by id', async () => {
      const id = faker.string.uuid();

      await repository.findByIdWithPassword(id);

      expect(queryBuilder.addSelect).toHaveBeenCalledWith('user.password');
      expect(queryBuilder.where).toHaveBeenCalledWith('user.id = :id', { id });
    });
  });

  describe('saveUnique', () => {
    it('returns the saved user on success', async () => {
      const user = buildUser();
      const save = jest.spyOn(repository, 'save').mockResolvedValue(user);

      await expect(repository.saveUnique(user)).resolves.toBe(user);
      expect(save).toHaveBeenCalledWith(user);
    });

    it('translates a Postgres unique violation into EmailAlreadyInUseException', async () => {
      const user = buildUser();
      jest
        .spyOn(repository, 'save')
        .mockRejectedValue(buildUniqueViolationError());

      await expect(repository.saveUnique(user)).rejects.toThrow(
        EmailAlreadyInUseException,
      );
    });

    it('rethrows any other error unchanged', async () => {
      const user = buildUser();
      const boom = new Error('connection reset');
      jest.spyOn(repository, 'save').mockRejectedValue(boom);

      await expect(repository.saveUnique(user)).rejects.toBe(boom);
    });
  });
});
