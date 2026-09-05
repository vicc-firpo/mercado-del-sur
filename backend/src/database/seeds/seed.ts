import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { dataSource } from '../../config/data-source';
import { Cart } from '../../cart/entities/cart.entity';
import { Product } from '../../products/entities/product.entity';
import { User } from '../../users/entities/user.entity';
import { RoleName } from '../../users/enums/role-name.enum';

/**
 * 1 admin, 1 customer (both password `password`),
 * an empty cart for the customer, and 2 dummy products. Re-running it skips
 * anything that already exists.
 *
 * Run from `backend/`: `npm run seed`
 */

const PASSWORD = 'password';
const SALT_ROUNDS = 10; // must match AuthService

async function upsertUser(
  repo: Repository<User>,
  data: Pick<User, 'firstName' | 'lastName' | 'email' | 'password' | 'role'>,
): Promise<User> {
  const existing = await repo.findOne({ where: { email: data.email } });
  if (existing) {
    console.log(`- user ${data.email} already exists, skipping`);
    return existing;
  }
  const user = await repo.save(repo.create(data));
  console.log(`- created ${data.role} user ${data.email}`);
  return user;
}

async function ensureCart(
  repo: Repository<Cart>,
  userId: string,
): Promise<void> {
  const existing = await repo.findOne({ where: { userId } });
  if (existing) {
    console.log(`- cart for user ${userId} already exists, skipping`);
    return;
  }
  await repo.save(repo.create({ userId }));
  console.log(`- created empty cart for user ${userId}`);
}

async function upsertProduct(
  repo: Repository<Product>,
  data: Pick<Product, 'name' | 'description' | 'price'>,
): Promise<void> {
  const existing = await repo.findOne({ where: { name: data.name } });
  if (existing) {
    console.log(`- product "${data.name}" already exists, skipping`);
    return;
  }
  await repo.save(repo.create(data));
  console.log(`- created product "${data.name}"`);
}

async function seed(): Promise<void> {
  await dataSource.initialize();
  try {
    const users = dataSource.getRepository(User);
    const carts = dataSource.getRepository(Cart);
    const products = dataSource.getRepository(Product);

    const passwordHash = await bcrypt.hash(PASSWORD, SALT_ROUNDS);

    await upsertUser(users, {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@mercadodelsur.com',
      password: passwordHash,
      role: RoleName.ADMIN,
    });

    const customer = await upsertUser(users, {
      firstName: 'Customer',
      lastName: 'User',
      email: 'customer@mercadodelsur.com',
      password: passwordHash,
      role: RoleName.CUSTOMER,
    });

    await ensureCart(carts, customer.id);

    await upsertProduct(products, {
      name: 'Dummy Product 1',
      description: 'A dummy product for local testing.',
      price: '19.90',
    });
    await upsertProduct(products, {
      name: 'Dummy Product 2',
      description: 'Another dummy product for local testing.',
      price: '49.00',
    });

    console.log('Seed complete.');
  } finally {
    await dataSource.destroy();
  }
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
