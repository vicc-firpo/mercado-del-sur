import { ForbiddenException, Inject, InjectionToken } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { faker } from '@faker-js/faker';
import {
  buildImage,
  buildImageWithProduct,
} from '../test/factories/image.factory';
import { buildProduct } from '../test/factories/product.factory';

jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: (entity: InjectionToken) => Inject(entity),
  getRepositoryToken: (entity: InjectionToken) => entity,
}));
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
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductStatusFilter } from './dto/find-products-query.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Image } from './entities/image.entity';
import { Product } from './entities/product.entity';
import { ImageNotFoundException } from './exceptions/image-not-found.exception';
import { InvalidImageFileException } from './exceptions/invalid-image-file.exception';
import { ProductNotFoundException } from './exceptions/product-not-found.exception';
import { ProductsService } from './products.service';

type MockedProductsRepository = {
  create: jest.Mock;
  save: jest.Mock;
  find: jest.Mock;
  findOne: jest.Mock;
  delete: jest.Mock;
};

type MockedImagesRepository = {
  create: jest.Mock;
  save: jest.Mock;
  findOne: jest.Mock;
  delete: jest.Mock;
};

describe('ProductsService', () => {
  let service: ProductsService;
  let productsRepository: MockedProductsRepository;
  let imagesRepository: MockedImagesRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Image),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(ProductsService);
    productsRepository = module.get<MockedProductsRepository>(
      getRepositoryToken(Product),
    );
    imagesRepository = module.get<MockedImagesRepository>(
      getRepositoryToken(Image),
    );
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
    it('returns only active products by default', async () => {
      const products = [buildProduct(), buildProduct()];
      productsRepository.find.mockResolvedValue(products);

      const result = await service.findAll();

      expect(productsRepository.find).toHaveBeenCalledWith({
        where: { isActive: true },
        relations: { images: true },
        order: { createdAt: 'ASC' },
      });
      expect(result).toHaveLength(2);
    });

    it('returns inactive products for an admin', async () => {
      productsRepository.find.mockResolvedValue([]);

      await service.findAll(ProductStatusFilter.INACTIVE, true);

      expect(productsRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: { isActive: false } }),
      );
    });

    it('returns every product for an admin when status is all', async () => {
      productsRepository.find.mockResolvedValue([]);

      await service.findAll(ProductStatusFilter.ALL, true);

      expect(productsRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: {} }),
      );
    });

    it('throws ForbiddenException when a non-admin requests inactive products', async () => {
      await expect(
        service.findAll(ProductStatusFilter.INACTIVE, false),
      ).rejects.toThrow(ForbiddenException);
      expect(productsRepository.find).not.toHaveBeenCalled();
    });

    it('throws ForbiddenException when a non-admin requests all products', async () => {
      await expect(
        service.findAll(ProductStatusFilter.ALL, false),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findOne', () => {
    it('returns an active product for a non-admin', async () => {
      const product = buildProduct({ isActive: true });
      productsRepository.findOne.mockResolvedValue(product);

      const result = await service.findOne(product.id);

      expect(result).toEqual(
        expect.objectContaining({ id: product.id, name: product.name }),
      );
    });

    it('throws ProductNotFoundException for an inactive product requested by a non-admin', async () => {
      const product = buildProduct({ isActive: false });
      productsRepository.findOne.mockResolvedValue(product);

      await expect(service.findOne(product.id)).rejects.toThrow(
        ProductNotFoundException,
      );
    });

    it('returns an inactive product for an admin', async () => {
      const product = buildProduct({ isActive: false });
      productsRepository.findOne.mockResolvedValue(product);

      const result = await service.findOne(product.id, true);

      expect(result).toEqual(expect.objectContaining({ id: product.id }));
    });

    it('throws ProductNotFoundException when the product does not exist', async () => {
      productsRepository.findOne.mockResolvedValue(null);

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
      productsRepository.findOne.mockResolvedValue(product);
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
      productsRepository.findOne.mockResolvedValue(null);
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
    it('updates the active flag and saves the product', async () => {
      const product = buildProduct({ isActive: true });
      productsRepository.findOne.mockResolvedValue(product);
      productsRepository.save.mockImplementation((p) => Promise.resolve(p));

      const result = await service.setActive(product.id, false);

      expect(productsRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ isActive: false }),
      );
      expect(result.active).toBe(false);
    });

    it('throws ProductNotFoundException when the product does not exist', async () => {
      productsRepository.findOne.mockResolvedValue(null);

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
      productsRepository.findOne.mockResolvedValue(product);
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
      productsRepository.findOne.mockResolvedValue(null);

      await expect(
        service.uploadImage(faker.string.uuid(), buildFile()),
      ).rejects.toThrow(ProductNotFoundException);
      expect(imagesRepository.create).not.toHaveBeenCalled();
    });

    it('throws InvalidImageFileException when no file is provided', async () => {
      const product = buildProduct();
      productsRepository.findOne.mockResolvedValue(product);

      await expect(
        service.uploadImage(
          product.id,
          undefined as unknown as Express.Multer.File,
        ),
      ).rejects.toThrow(InvalidImageFileException);
    });

    it('throws InvalidImageFileException for an unsupported mime type', async () => {
      const product = buildProduct();
      productsRepository.findOne.mockResolvedValue(product);

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
      productsRepository.findOne.mockResolvedValue(product);
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
      imagesRepository.findOne.mockResolvedValue(image);
      (fsPromises.unlink as jest.Mock).mockResolvedValue(undefined);

      await service.deleteImage(image.productId, image.id);

      expect(imagesRepository.delete).toHaveBeenCalledWith(image.id);
      expect(fsPromises.unlink).toHaveBeenCalledWith(
        expect.stringContaining(image.id),
      );
    });

    it('throws ImageNotFoundException when the image does not exist', async () => {
      imagesRepository.findOne.mockResolvedValue(null);

      await expect(
        service.deleteImage(faker.string.uuid(), faker.string.uuid()),
      ).rejects.toThrow(ImageNotFoundException);
    });
  });

  describe('streamImage', () => {
    it('streams the image of an active product for a non-admin', async () => {
      const image = buildImageWithProduct({ isActive: true });
      imagesRepository.findOne.mockResolvedValue(image);
      (fsPromises.access as jest.Mock).mockResolvedValue(undefined);
      const fakeStream = {};
      (createReadStream as jest.Mock).mockReturnValue(fakeStream);

      const result = await service.streamImage(image.productId, image.id);

      expect(result.stream).toBe(fakeStream);
      expect(result.mimeType).toBe('image/jpeg');
    });

    it('throws ImageNotFoundException for an inactive product when the caller is not an admin', async () => {
      const image = buildImageWithProduct({ isActive: false });
      imagesRepository.findOne.mockResolvedValue(image);

      await expect(
        service.streamImage(image.productId, image.id),
      ).rejects.toThrow(ImageNotFoundException);
      expect(fsPromises.access).not.toHaveBeenCalled();
    });

    it('streams the image of an inactive product for an admin', async () => {
      const image = buildImageWithProduct({ isActive: false });
      imagesRepository.findOne.mockResolvedValue(image);
      (fsPromises.access as jest.Mock).mockResolvedValue(undefined);
      (createReadStream as jest.Mock).mockReturnValue({});

      const result = await service.streamImage(image.productId, image.id, true);

      expect(result.mimeType).toBe('image/jpeg');
    });

    it('throws ImageNotFoundException when the file is missing from disk', async () => {
      const image = buildImageWithProduct({ isActive: true });
      imagesRepository.findOne.mockResolvedValue(image);
      (fsPromises.access as jest.Mock).mockRejectedValue(new Error('ENOENT'));

      await expect(
        service.streamImage(image.productId, image.id),
      ).rejects.toThrow(ImageNotFoundException);
    });

    it('throws ImageNotFoundException when the image does not exist', async () => {
      imagesRepository.findOne.mockResolvedValue(null);

      await expect(
        service.streamImage(faker.string.uuid(), faker.string.uuid()),
      ).rejects.toThrow(ImageNotFoundException);
    });
  });
});
