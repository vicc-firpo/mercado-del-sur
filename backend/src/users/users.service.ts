import { Injectable } from '@nestjs/common';
import { CartService } from '../cart/cart.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserDto } from './dto/user.dto';
import { RoleName } from './enums/role-name.enum';
import { User } from './entities/user.entity';
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
}
