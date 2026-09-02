import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';
import { Role, RoleName } from './entities/role.entity';
import { User } from './entities/user.entity';
import { EmailAlreadyInUseException } from './exceptions/email-already-in-use.exception';
import { UserNotFoundException } from './exceptions/user-not-found.exception';

const UNIQUE_VIOLATION = '23505';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly rolesRepository: Repository<Role>,
  ) {}

  async create(dto: CreateUserDto, passwordHash: string): Promise<UserDto> {
    const customerRole = await this.rolesRepository.findOneByOrFail({
      name: RoleName.CUSTOMER,
    });
    const user = this.usersRepository.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      password: passwordHash,
      roles: [customerRole],
    });
    return UserDto.fromEntity(await this.save(user));
  }

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'roles')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.id = :id', { id })
      .getOne();
    if (!user) {
      throw new UserNotFoundException(id);
    }
    return user;
  }

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    const result = await this.usersRepository.update(id, {
      password: passwordHash,
    });
    if (!result.affected) {
      throw new UserNotFoundException(id);
    }
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
