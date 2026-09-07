import { Injectable } from '@nestjs/common';
import { CartService } from '../cart/cart.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';
import { RoleName } from './enums/role-name.enum';
import { User } from './entities/user.entity';
import { UserNotFoundException } from './exceptions/user-not-found.exception';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly cartService: CartService,
  ) {}

  async create(dto: CreateUserDto, passwordHash: string): Promise<UserDto> {
    const user = this.usersRepository.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      password: passwordHash,
      role: RoleName.CUSTOMER,
    });
    const saved = await this.usersRepository.saveUnique(user);
    await this.cartService.createCartForUser(saved.id);
    return UserDto.fromEntity(saved);
  }

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findByEmailWithPassword(email);
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findByIdWithPassword(id);
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
    return UserDto.fromEntity(await this.usersRepository.saveUnique(user));
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
}
