import { Injectable } from '@nestjs/common';
import { DataSource, QueryFailedError, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { EmailAlreadyInUseException } from './exceptions/email-already-in-use.exception';

const UNIQUE_VIOLATION = '23505';

@Injectable()
export class UsersRepository extends Repository<User> {
  constructor(dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  findByEmailWithPassword(email: string): Promise<User | null> {
    return this.createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();
  }

  async saveUnique(user: User): Promise<User> {
    try {
      return await this.save(user);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string }).code === UNIQUE_VIOLATION
      ) {
        throw new EmailAlreadyInUseException(user.email);
      }
      throw error;
    }
  }
}
