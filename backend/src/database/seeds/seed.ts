import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import { join } from 'path';
import { Repository } from 'typeorm';
import { dataSource } from '../../config/data-source';
import { Cart } from '../../cart/entities/cart.entity';
import { Image } from '../../products/entities/image.entity';
import { Product } from '../../products/entities/product.entity';
import { ImageExtension } from '../../products/enums/image-extension.enum';
import { MIME_TYPE_TO_EXTENSION } from '../../products/image-mime-types';
import { User } from '../../users/entities/user.entity';
import { RoleName } from '../../users/enums/role-name.enum';
import { CatalogProduct, PRODUCT_CATALOG } from './product-catalog';

/**
 * 1 admin, 1 customer (both password `password`), an empty cart for the
 * customer, and the furniture catalog from `product-catalog.ts` — each product
 * with three images downloaded from Unsplash into `data/images/`. Re-running it
 * skips anything that already exists; products left without images (e.g. an
 * earlier run with no network) get their images retried.
 *
 * Run from `backend/`: `npm run seed`
 */

const PASSWORD = 'password';
const SALT_ROUNDS = 10; // must match AuthService

const IMAGES_DIR = join(process.cwd(), 'data', 'images');

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

/**
 * Downloads one image, stores its file in `data/images/` and returns a
 * persisted `Image` row, or `null` when the download fails (best effort — a
 * missing image should not abort the whole seed).
 */
async function downloadImage(
  repo: Repository<Image>,
  productId: string,
  url: string,
): Promise<Image | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const contentType =
      response.headers.get('content-type')?.split(';')[0] ?? '';
    const extension: ImageExtension | undefined =
      MIME_TYPE_TO_EXTENSION[contentType];
    if (!extension) {
      throw new Error(`unsupported content-type "${contentType}"`);
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    const id = randomUUID();
    await fs.mkdir(IMAGES_DIR, { recursive: true });
    await fs.writeFile(join(IMAGES_DIR, `${id}.${extension}`), buffer);
    return repo.save(repo.create({ id, extension, productId }));
  } catch (error) {
    console.warn(
      `  ! failed to download image ${url}: ${(error as Error).message}`,
    );
    return null;
  }
}

async function seedCatalogProduct(
  products: Repository<Product>,
  images: Repository<Image>,
  data: CatalogProduct,
): Promise<void> {
  let product = await products.findOne({
    where: { name: data.name },
    relations: { images: true },
  });

  if (product) {
    console.log(`- product "${data.name}" already exists, skipping`);
  } else {
    product = await products.save(
      products.create({
        name: data.name,
        description: data.description,
        price: data.price,
      }),
    );
    console.log(`- created product "${data.name}"`);
  }

  if (product.images && product.images.length > 0) {
    return;
  }

  let stored = 0;
  for (const url of data.imageUrls) {
    const image = await downloadImage(images, product.id, url);
    if (image) {
      stored += 1;
    }
  }
  console.log(
    `  + ${stored}/${data.imageUrls.length} images for "${data.name}"`,
  );
}

async function seed(): Promise<void> {
  await dataSource.initialize();
  try {
    const users = dataSource.getRepository(User);
    const carts = dataSource.getRepository(Cart);
    const products = dataSource.getRepository(Product);
    const images = dataSource.getRepository(Image);

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

    for (const entry of PRODUCT_CATALOG) {
      await seedCatalogProduct(products, images, entry);
    }

    console.log('Seed complete.');
  } finally {
    await dataSource.destroy();
  }
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
