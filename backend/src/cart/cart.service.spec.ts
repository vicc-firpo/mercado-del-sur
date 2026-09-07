import { Inject, InjectionToken } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { faker } from '@faker-js/faker';
import { buildCartItem } from '../test/factories/cart-item.factory';
import { buildCart } from '../test/factories/cart.factory';
import { buildProduct } from '../test/factories/product.factory';

jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: (entity: InjectionToken) => Inject(entity),
  getRepositoryToken: (entity: InjectionToken) => entity,
}));
import { getRepositoryToken } from '@nestjs/typeorm';
import { CartItemsRepository } from './cart-items.repository';
import { CartService } from './cart.service';
import { CartsRepository } from './carts.repository';
import { CartItemNotFoundException } from './exceptions/cart-item-not-found.exception';
import { Product } from '../products/entities/product.entity';
import { ProductNotFoundException } from '../products/exceptions/product-not-found.exception';

type MockedCartsRepository = {
  create: jest.Mock;
  save: jest.Mock;
  findOneByUserWithItems: jest.Mock;
};

type MockedCartItemsRepository = {
  upsertQuantity: jest.Mock;
  findOneWithProduct: jest.Mock;
  delete: jest.Mock;
};

type MockedProductsRepository = {
  findOne: jest.Mock;
};

describe('CartService', () => {
  let service: CartService;
  let cartsRepository: MockedCartsRepository;
  let cartItemsRepository: MockedCartItemsRepository;
  let productsRepository: MockedProductsRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        {
          provide: CartsRepository,
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOneByUserWithItems: jest.fn(),
          },
        },
        {
          provide: CartItemsRepository,
          useValue: {
            upsertQuantity: jest.fn(),
            findOneWithProduct: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Product),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(CartService);
    cartsRepository = module.get<MockedCartsRepository>(CartsRepository);
    cartItemsRepository =
      module.get<MockedCartItemsRepository>(CartItemsRepository);
    productsRepository = module.get<MockedProductsRepository>(
      getRepositoryToken(Product),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createCartForUser', () => {
    it('creates and saves a cart for the given user', async () => {
      const userId = faker.string.uuid();
      const created = buildCart({ userId });
      cartsRepository.create.mockReturnValue(created);
      cartsRepository.save.mockResolvedValue(created);

      const result = await service.createCartForUser(userId);

      expect(cartsRepository.create).toHaveBeenCalledWith({ userId });
      expect(cartsRepository.save).toHaveBeenCalledWith(created);
      expect(result).toBe(created);
    });
  });

  describe('getCart', () => {
    it('returns an empty cart dto when there are no items', async () => {
      const cart = buildCart({ items: [] });
      cartsRepository.findOneByUserWithItems.mockResolvedValue(cart);

      const result = await service.getCart(cart.userId);

      expect(result).toEqual({ items: [], total: 0 });
    });

    it('returns items with subtotals and the overall total', async () => {
      const product = buildProduct({ price: '10.00' });
      const item = buildCartItem({
        product,
        productId: product.id,
        quantity: 3,
      });
      const cart = buildCart({ items: [item] });
      cartsRepository.findOneByUserWithItems.mockResolvedValue(cart);

      const result = await service.getCart(cart.userId);

      expect(result.items).toHaveLength(1);
      expect(result.items[0].subtotal).toBe(30);
      expect(result.total).toBe(30);
    });

    it('throws when the user has no cart', async () => {
      cartsRepository.findOneByUserWithItems.mockResolvedValue(null);

      await expect(service.getCart(faker.string.uuid())).rejects.toThrow();
    });
  });

  describe('addItem', () => {
    it('throws ProductNotFoundException when the product does not exist', async () => {
      productsRepository.findOne.mockResolvedValue(null);

      await expect(
        service.addItem(faker.string.uuid(), faker.string.uuid(), 2),
      ).rejects.toThrow(ProductNotFoundException);
      expect(cartItemsRepository.upsertQuantity).not.toHaveBeenCalled();
    });

    it('upserts the item quantity through the repository', async () => {
      const product = buildProduct();
      const cart = buildCart();
      const savedItem = buildCartItem({
        cartId: cart.id,
        product,
        productId: product.id,
        quantity: 4,
      });
      productsRepository.findOne.mockResolvedValue(product);
      cartsRepository.findOneByUserWithItems.mockResolvedValue(cart);
      cartItemsRepository.findOneWithProduct.mockResolvedValue(savedItem);

      const result = await service.addItem(cart.userId, product.id, 4);

      expect(cartItemsRepository.upsertQuantity).toHaveBeenCalledWith(
        cart.id,
        product.id,
        4,
      );
      expect(result.quantity).toBe(4);
    });
  });

  describe('removeItem', () => {
    it('deletes the item when it exists', async () => {
      const cart = buildCart();
      const productId = faker.string.uuid();
      cartsRepository.findOneByUserWithItems.mockResolvedValue(cart);
      cartItemsRepository.delete.mockResolvedValue({ affected: 1 });

      await service.removeItem(cart.userId, productId);

      expect(cartItemsRepository.delete).toHaveBeenCalledWith({
        cartId: cart.id,
        productId,
      });
    });

    it('throws CartItemNotFoundException when no rows are affected', async () => {
      const cart = buildCart();
      cartsRepository.findOneByUserWithItems.mockResolvedValue(cart);
      cartItemsRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(
        service.removeItem(cart.userId, faker.string.uuid()),
      ).rejects.toThrow(CartItemNotFoundException);
    });
  });

  describe('getCartForCheckout', () => {
    it('returns the cart entity for the user', async () => {
      const cart = buildCart({ items: [buildCartItem()] });
      cartsRepository.findOneByUserWithItems.mockResolvedValue(cart);

      const result = await service.getCartForCheckout(cart.userId);

      expect(result).toBe(cart);
    });

    it('throws when the user has no cart', async () => {
      cartsRepository.findOneByUserWithItems.mockResolvedValue(null);

      await expect(
        service.getCartForCheckout(faker.string.uuid()),
      ).rejects.toThrow();
    });
  });

  describe('clearCart', () => {
    it('deletes every item of the user cart, keeping the cart', async () => {
      const cart = buildCart({ items: [buildCartItem()] });
      cartsRepository.findOneByUserWithItems.mockResolvedValue(cart);
      cartItemsRepository.delete.mockResolvedValue({ affected: 1 });

      await service.clearCart(cart.userId);

      expect(cartItemsRepository.delete).toHaveBeenCalledWith({
        cartId: cart.id,
      });
    });

    it('throws when the user has no cart', async () => {
      cartsRepository.findOneByUserWithItems.mockResolvedValue(null);

      await expect(service.clearCart(faker.string.uuid())).rejects.toThrow();
      expect(cartItemsRepository.delete).not.toHaveBeenCalled();
    });
  });
});
