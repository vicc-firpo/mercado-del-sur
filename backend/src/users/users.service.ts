import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';
import { User } from './entities/user.entity';
import { EmailAlreadyInUseException } from './exceptions/email-already-in-use.exception';
import { UserNotFoundException } from './exceptions/user-not-found.exception';

const UNIQUE_VIOLATION = '23505';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(dto: CreateUserDto): Promise<UserDto> {
    const user = this.usersRepository.create(dto);
    return UserDto.fromEntity(await this.save(user));
  }

  async findAll(): Promise<UserDto[]> {
    const users = await this.usersRepository.find({
      order: { createdAt: 'ASC' },
    });
    return users.map((user) => UserDto.fromEntity(user));
  }

  async findOne(id: string): Promise<UserDto> {
    return UserDto.fromEntity(await this.getOrFail(id));
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserDto> {
    const user = await this.getOrFail(id);
    Object.assign(user, dto);
    return UserDto.fromEntity(await this.save(user));
  }

  async delete(id: string): Promise<void> {
    const result = await this.usersRepository.delete(id);
    if (!result.affected) {
      throw new UserNotFoundException(id);
    }
  }

  private async getOrFail(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new UserNotFoundException(id);
    }
    return user;
  }

  private async save(user: User): Promise<User> {
    try {
      return await this.usersRepository.save(user);
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
