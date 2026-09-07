import { ForbiddenException, Inject, InjectionToken } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, EntityManager } from 'typeorm';
import { faker } from '@faker-js/faker';

jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: (entity: InjectionToken) => Inject(entity),
  getRepositoryToken: (entity: InjectionToken) => entity,
}));

import { CartService } from '../cart/cart.service';
import {
  buildImage,
  buildImageWithProduct,
} from '../test/factories/image.factory';
import { buildProduct } from '../test/factories/product.factory';

jest.mock('fs', () => ({
  createReadStream: jest.fn(),
  promises: {
    access: jest.fn(),
    mkdir: jest.fn(),
    writeFile: jest.fn(),
    unlink: jest.fn(),
  },
}));
import { createReadStream, promises as fsPromises } from 'fs';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductStatusFilter } from './dto/find-products-query.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { ImageNotFoundException } from './exceptions/image-not-found.exception';
import { InvalidImageFileException } from './exceptions/invalid-image-file.exception';
import { ProductNotFoundException } from './exceptions/product-not-found.exception';
import { ImagesRepository } from './images.repository';
import { ProductsRepository } from './products.repository';
import { ProductsService } from './products.service';

type MockedProductsRepository = {
  search: jest.Mock;
  findOneWithImages: jest.Mock;
  create: jest.Mock;
  save: jest.Mock;
  delete: jest.Mock;
};

type MockedImagesRepository = {
  findOneWithProduct: jest.Mock;
  create: jest.Mock;
  save: jest.Mock;
  delete: jest.Mock;
};

describe('ProductsService', () => {
  let service: ProductsService;
  let productsRepository: MockedProductsRepository;
  let imagesRepository: MockedImagesRepository;
  let cartService: { removeProductFromAllCarts: jest.Mock };
  let transactionManager: { update: jest.Mock };
  let dataSource: { transaction: jest.Mock };

  beforeEach(async () => {
    transactionManager = { update: jest.fn() };
    dataSource = {
      transaction: jest.fn(
        (runInTransaction: (manager: EntityManager) => unknown) =>
          runInTransaction(transactionManager as unknown as EntityManager),
      ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: ProductsRepository,
          useValue: {
            search: jest.fn().mockResolvedValue([]),
            findOneWithImages: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: ImagesRepository,
          useValue: {
            findOneWithProduct: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: CartService,
          useValue: { removeProductFromAllCarts: jest.fn() },
        },
        {
          provide: DataSource,
          useValue: dataSource,
        },
      ],
    }).compile();

    service = module.get(ProductsService);
    productsRepository =
      module.get<MockedProductsRepository>(ProductsRepository);
    imagesRepository = module.get<MockedImagesRepository>(ImagesRepository);
    cartService = module.get(CartService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('creates an active product by default and returns its dto', async () => {
      const dto: CreateProductDto = {
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        price: 19.9,
      };
      const created = buildProduct({
        name: dto.name,
        description: dto.description,
        price: '19.90',
        isActive: true,
      });
      productsRepository.create.mockReturnValue(created);
      productsRepository.save.mockResolvedValue(created);

      const result = await service.create(dto);

      expect(productsRepository.create).toHaveBeenCalledWith({
        name: dto.name,
        description: dto.description,
        price: '19.90',
        isActive: true,
      });
      expect(productsRepository.save).toHaveBeenCalledWith(created);
      expect(result).toEqual(
        expect.objectContaining({ id: created.id, name: created.name }),
      );
    });

    it('respects an explicit active flag', async () => {
      const dto: CreateProductDto = {
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        price: 5,
        active: false,
      };
      const created = buildProduct({ isActive: false });
      productsRepository.create.mockReturnValue(created);
      productsRepository.save.mockResolvedValue(created);

      await service.create(dto);

      expect(productsRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ isActive: false }),
      );
    });
  });

  describe('findAll', () => {
    it('asks the repository for active products only by default', async () => {
      const products = [buildProduct(), buildProduct()];
      productsRepository.search.mockResolvedValue(products);

      const result = await service.findAll();

      expect(productsRepository.search).toHaveBeenCalledWith({
        activeFilter: true,
        term: undefined,
      });
      expect(result).toHaveLength(2);
    });

    it('asks for inactive products only when an admin filters by inactive', async () => {
      await service.findAll(ProductStatusFilter.INACTIVE, true);

      expect(productsRepository.search).toHaveBeenCalledWith({
        activeFilter: false,
        term: undefined,
      });
    });

    it('does not filter by status when an admin requests all products', async () => {
      await service.findAll(ProductStatusFilter.ALL, true);

      expect(productsRepository.search).toHaveBeenCalledWith({
        activeFilter: undefined,
        term: undefined,
      });
    });

    it('throws ForbiddenException when a non-admin requests inactive products', async () => {
      await expect(
        service.findAll(ProductStatusFilter.INACTIVE, false),
      ).rejects.toThrow(ForbiddenException);
      expect(productsRepository.search).not.toHaveBeenCalled();
    });

    it('throws ForbiddenException when a non-admin requests all products', async () => {
      await expect(
        service.findAll(ProductStatusFilter.ALL, false),
      ).rejects.toThrow(ForbiddenException);
    });

    it('forwards the trimmed search term to the repository', async () => {
      await service.findAll(undefined, false, '  Sofá  ');

      expect(productsRepository.search).toHaveBeenCalledWith({
        activeFilter: true,
        term: 'Sofá',
      });
    });
  });

  describe('findOne', () => {
    it('returns an active product for a non-admin', async () => {
      const product = buildProduct({ isActive: true });
      productsRepository.findOneWithImages.mockResolvedValue(product);

      const result = await service.findOne(product.id);

      expect(result).toEqual(
        expect.objectContaining({ id: product.id, name: product.name }),
      );
    });

    it('throws ProductNotFoundException for an inactive product requested by a non-admin', async () => {
      const product = buildProduct({ isActive: false });
      productsRepository.findOneWithImages.mockResolvedValue(product);

      await expect(service.findOne(product.id)).rejects.toThrow(
        ProductNotFoundException,
      );
    });

    it('returns an inactive product for an admin', async () => {
      const product = buildProduct({ isActive: false });
      productsRepository.findOneWithImages.mockResolvedValue(product);

      const result = await service.findOne(product.id, true);

      expect(result).toEqual(expect.objectContaining({ id: product.id }));
    });

    it('throws ProductNotFoundException when the product does not exist', async () => {
      productsRepository.findOneWithImages.mockResolvedValue(null);

      await expect(service.findOne(faker.string.uuid())).rejects.toThrow(
        ProductNotFoundException,
      );
    });
  });

  describe('update', () => {
    it('overwrites the product fields and saves it', async () => {
      const product = buildProduct();
      const dto: UpdateProductDto = {
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        price: 42,
      };
      productsRepository.findOneWithImages.mockResolvedValue(product);
      productsRepository.save.mockImplementation((p) => Promise.resolve(p));

      const result = await service.update(product.id, dto);

      expect(productsRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          name: dto.name,
          description: dto.description,
          price: '42.00',
        }),
      );
      expect(result).toEqual(expect.objectContaining({ name: dto.name }));
    });

    it('throws ProductNotFoundException when the product does not exist', async () => {
      productsRepository.findOneWithImages.mockResolvedValue(null);
      const dto: UpdateProductDto = {
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        price: 10,
      };

      await expect(service.update(faker.string.uuid(), dto)).rejects.toThrow(
        ProductNotFoundException,
      );
    });
  });

  describe('setActive', () => {
    it('deactivates the product and unlinks it from every cart in one transaction', async () => {
      const product = buildProduct({ isActive: true });
      productsRepository.findOneWithImages.mockResolvedValue(product);

      const result = await service.setActive(product.id, false);

      expect(dataSource.transaction).toHaveBeenCalledTimes(1);
      expect(transactionManager.update).toHaveBeenCalledWith(
        Product,
        product.id,
        {
          isActive: false,
        },
      );
      expect(cartService.removeProductFromAllCarts).toHaveBeenCalledWith(
        product.id,
        transactionManager,
      );
      expect(productsRepository.save).not.toHaveBeenCalled();
      expect(result.active).toBe(false);
    });

    it('reactivates the product without touching carts', async () => {
      const product = buildProduct({ isActive: false });
      productsRepository.findOneWithImages.mockResolvedValue(product);
      productsRepository.save.mockImplementation((p) => Promise.resolve(p));

      const result = await service.setActive(product.id, true);

      expect(productsRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ isActive: true }),
      );
      expect(dataSource.transaction).not.toHaveBeenCalled();
      expect(cartService.removeProductFromAllCarts).not.toHaveBeenCalled();
      expect(result.active).toBe(true);
    });

    it('is a no-op when the product already has the requested status', async () => {
      const product = buildProduct({ isActive: true });
      productsRepository.findOneWithImages.mockResolvedValue(product);

      await service.setActive(product.id, true);

      expect(productsRepository.save).not.toHaveBeenCalled();
      expect(dataSource.transaction).not.toHaveBeenCalled();
      expect(cartService.removeProductFromAllCarts).not.toHaveBeenCalled();
    });

    it('throws ProductNotFoundException when the product does not exist', async () => {
      productsRepository.findOneWithImages.mockResolvedValue(null);

      await expect(
        service.setActive(faker.string.uuid(), true),
      ).rejects.toThrow(ProductNotFoundException);
    });
  });

  describe('delete', () => {
    it('deletes the product when it exists', async () => {
      const id = faker.string.uuid();
      productsRepository.delete.mockResolvedValue({ affected: 1 });

      await service.delete(id);

      expect(productsRepository.delete).toHaveBeenCalledWith(id);
    });

    it('throws ProductNotFoundException when no rows are affected', async () => {
      productsRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.delete(faker.string.uuid())).rejects.toThrow(
        ProductNotFoundException,
      );
    });
  });

  describe('uploadImage', () => {
    const buildFile = (
      overrides: Partial<Express.Multer.File> = {},
    ): Express.Multer.File =>
      ({
        mimetype: 'image/jpeg',
        buffer: Buffer.from('fake-image'),
        ...overrides,
      }) as Express.Multer.File;

    it('saves the image and writes it to disk', async () => {
      const product = buildProduct();
      const image = buildImage({ productId: product.id });
      productsRepository.findOneWithImages.mockResolvedValue(product);
      imagesRepository.create.mockReturnValue(image);
      imagesRepository.save.mockResolvedValue(image);
      (fsPromises.mkdir as jest.Mock).mockResolvedValue(undefined);
      (fsPromises.writeFile as jest.Mock).mockResolvedValue(undefined);

      const result = await service.uploadImage(product.id, buildFile());

      expect(imagesRepository.create).toHaveBeenCalledWith({
        extension: 'jpg',
        productId: product.id,
      });
      expect(fsPromises.writeFile).toHaveBeenCalledWith(
        expect.stringContaining(image.id),
        expect.any(Buffer),
      );
      expect(result).toEqual(
        expect.objectContaining({ id: image.id, productId: product.id }),
      );
    });

    it('throws ProductNotFoundException when the product does not exist', async () => {
      productsRepository.findOneWithImages.mockResolvedValue(null);

      await expect(
        service.uploadImage(faker.string.uuid(), buildFile()),
      ).rejects.toThrow(ProductNotFoundException);
      expect(imagesRepository.create).not.toHaveBeenCalled();
    });

    it('throws InvalidImageFileException when no file is provided', async () => {
      const product = buildProduct();
      productsRepository.findOneWithImages.mockResolvedValue(product);

      await expect(
        service.uploadImage(
          product.id,
          undefined as unknown as Express.Multer.File,
        ),
      ).rejects.toThrow(InvalidImageFileException);
    });

    it('throws InvalidImageFileException for an unsupported mime type', async () => {
      const product = buildProduct();
      productsRepository.findOneWithImages.mockResolvedValue(product);

      await expect(
        service.uploadImage(
          product.id,
          buildFile({ mimetype: 'application/pdf' }),
        ),
      ).rejects.toThrow(InvalidImageFileException);
      expect(imagesRepository.create).not.toHaveBeenCalled();
    });

    it('deletes the persisted image record when writing the file fails', async () => {
      const product = buildProduct();
      const image = buildImage({ productId: product.id });
      productsRepository.findOneWithImages.mockResolvedValue(product);
      imagesRepository.create.mockReturnValue(image);
      imagesRepository.save.mockResolvedValue(image);
      const writeError = new Error('disk full');
      (fsPromises.mkdir as jest.Mock).mockResolvedValue(undefined);
      (fsPromises.writeFile as jest.Mock).mockRejectedValue(writeError);

      await expect(
        service.uploadImage(product.id, buildFile()),
      ).rejects.toThrow(writeError);
      expect(imagesRepository.delete).toHaveBeenCalledWith(image.id);
    });
  });

  describe('deleteImage', () => {
    it('deletes the image record and its file', async () => {
      const image = buildImageWithProduct();
      imagesRepository.findOneWithProduct.mockResolvedValue(image);
      (fsPromises.unlink as jest.Mock).mockResolvedValue(undefined);

      await service.deleteImage(image.productId, image.id);

      expect(imagesRepository.delete).toHaveBeenCalledWith(image.id);
      expect(fsPromises.unlink).toHaveBeenCalledWith(
        expect.stringContaining(image.id),
      );
    });

    it('throws ImageNotFoundException when the image does not exist', async () => {
      imagesRepository.findOneWithProduct.mockResolvedValue(null);

      await expect(
        service.deleteImage(faker.string.uuid(), faker.string.uuid()),
      ).rejects.toThrow(ImageNotFoundException);
    });
  });

  describe('streamImage', () => {
    it('streams the image of an active product', async () => {
      const image = buildImageWithProduct({ isActive: true });
      imagesRepository.findOneWithProduct.mockResolvedValue(image);
      (fsPromises.access as jest.Mock).mockResolvedValue(undefined);
      const fakeStream = {};
      (createReadStream as jest.Mock).mockReturnValue(fakeStream);

      const result = await service.streamImage(image.productId, image.id);

      expect(result.stream).toBe(fakeStream);
      expect(result.mimeType).toBe('image/jpeg');
    });

    it('streams the image of an inactive product (bytes are not gated by status)', async () => {
      const image = buildImageWithProduct({ isActive: false });
      imagesRepository.findOneWithProduct.mockResolvedValue(image);
      (fsPromises.access as jest.Mock).mockResolvedValue(undefined);
      (createReadStream as jest.Mock).mockReturnValue({});

      const result = await service.streamImage(image.productId, image.id);

      expect(result.mimeType).toBe('image/jpeg');
    });

    it('throws ImageNotFoundException when the file is missing from disk', async () => {
      const image = buildImageWithProduct({ isActive: true });
      imagesRepository.findOneWithProduct.mockResolvedValue(image);
      (fsPromises.access as jest.Mock).mockRejectedValue(new Error('ENOENT'));

      await expect(
        service.streamImage(image.productId, image.id),
      ).rejects.toThrow(ImageNotFoundException);
    });

    it('throws ImageNotFoundException when the image does not exist', async () => {
      imagesRepository.findOneWithProduct.mockResolvedValue(null);

      await expect(
        service.streamImage(faker.string.uuid(), faker.string.uuid()),
      ).rejects.toThrow(ImageNotFoundException);
    });
  });
});
