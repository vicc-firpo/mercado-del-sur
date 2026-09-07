import { DataSource, EntityManager, SelectQueryBuilder } from 'typeorm';
import { faker } from '@faker-js/faker';
import { buildCart } from '../test/factories/cart.factory';
import { buildCartItem } from '../test/factories/cart-item.factory';
import { CartItemsRepository } from './cart-items.repository';
import { CartsRepository } from './carts.repository';
import { CartItem } from './entities/cart-item.entity';

const stubDataSource = {
  createEntityManager: () => ({}),
} as unknown as DataSource;

describe('CartsRepository', () => {
  let repository: CartsRepository;

  beforeEach(() => {
    repository = new CartsRepository(stubDataSource);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('findOneByUserWithItems', () => {
    it('loads the cart of a user with items, products and images', async () => {
      const userId = faker.string.uuid();
      const cart = buildCart({ userId });
      const findOne = jest.spyOn(repository, 'findOne').mockResolvedValue(cart);

      await expect(repository.findOneByUserWithItems(userId)).resolves.toBe(
        cart,
      );
      expect(findOne).toHaveBeenCalledWith({
        where: { userId },
        relations: { items: { product: { images: true } } },
      });
    });
  });
});

describe('CartItemsRepository', () => {
  let repository: CartItemsRepository;
  let insertQueryBuilder: {
    insert: jest.Mock;
    into: jest.Mock;
    values: jest.Mock;
    orUpdate: jest.Mock;
    execute: jest.Mock;
  };

  beforeEach(() => {
    repository = new CartItemsRepository(stubDataSource);
    insertQueryBuilder = {
      insert: jest.fn().mockReturnThis(),
      into: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      orUpdate: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue(undefined),
    };
    jest
      .spyOn(repository, 'createQueryBuilder')
      .mockReturnValue(
        insertQueryBuilder as unknown as SelectQueryBuilder<CartItem>,
      );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('upsertQuantity', () => {
    it('inserts the item or overwrites its quantity on conflict', async () => {
      const cartId = faker.string.uuid();
      const productId = faker.string.uuid();

      await repository.upsertQuantity(cartId, productId, 4);

      expect(insertQueryBuilder.values).toHaveBeenCalledWith({
        cartId,
        productId,
        quantity: 4,
      });
      expect(insertQueryBuilder.orUpdate).toHaveBeenCalledWith(
        ['quantity'],
        ['cart_id', 'product_id'],
      );
      expect(insertQueryBuilder.execute).toHaveBeenCalled();
    });
  });

  describe('findOneWithProduct', () => {
    it('scopes the lookup to the cart and product and includes the product', async () => {
      const cartId = faker.string.uuid();
      const item = buildCartItem({ cartId });
      const findOne = jest.spyOn(repository, 'findOne').mockResolvedValue(item);

      await expect(
        repository.findOneWithProduct(cartId, item.productId),
      ).resolves.toBe(item);
      expect(findOne).toHaveBeenCalledWith({
        where: { cartId, productId: item.productId },
        relations: { product: true },
      });
    });
  });

  describe('deleteByProductId', () => {
    it('deletes every cart item that references the product', async () => {
      const productId = faker.string.uuid();
      const del = jest
        .spyOn(repository, 'delete')
        .mockResolvedValue({ affected: 2, raw: [] });

      await repository.deleteByProductId(productId);

      expect(del).toHaveBeenCalledWith({ productId });
    });

    it('uses the transaction manager repository when one is provided', async () => {
      const productId = faker.string.uuid();
      const managerDelete = jest
        .fn()
        .mockResolvedValue({ affected: 1, raw: [] });
      const getRepository = jest
        .fn()
        .mockReturnValue({ delete: managerDelete });
      const manager = { getRepository } as unknown as EntityManager;
      const del = jest.spyOn(repository, 'delete');

      await repository.deleteByProductId(productId, manager);

      expect(getRepository).toHaveBeenCalledWith(CartItem);
      expect(managerDelete).toHaveBeenCalledWith({ productId });
      expect(del).not.toHaveBeenCalled();
    });
  });
});
