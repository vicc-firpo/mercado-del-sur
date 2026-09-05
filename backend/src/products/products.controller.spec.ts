import { Inject, InjectionToken, StreamableFile } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { faker } from '@faker-js/faker';
import { Readable } from 'stream';
import { buildProduct } from '../test/factories/product.factory';

jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: (entity: InjectionToken) => Inject(entity),
  getRepositoryToken: (entity: InjectionToken) => entity,
}));
import { AuthUser } from '../auth/jwt-payload.interface';
import { RoleName } from '../users/enums/role-name.enum';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductStatusFilter } from './dto/find-products-query.dto';
import { ProductDto } from './dto/product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateProductStatusDto } from './dto/update-product-status.dto';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

type MockedProductsService = {
  create: jest.Mock;
  findAll: jest.Mock;
  findOne: jest.Mock;
  update: jest.Mock;
  setActive: jest.Mock;
  delete: jest.Mock;
  uploadImage: jest.Mock;
  deleteImage: jest.Mock;
  streamImage: jest.Mock;
};

describe('ProductsController', () => {
  let controller: ProductsController;
  let productsService: MockedProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            setActive: jest.fn(),
            delete: jest.fn(),
            uploadImage: jest.fn(),
            deleteImage: jest.fn(),
            streamImage: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(ProductsController);
    productsService = module.get<MockedProductsService>(ProductsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('delegates creation to the service', async () => {
      const dto: CreateProductDto = {
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        price: 10,
      };
      const created = ProductDto.fromEntity(buildProduct());
      productsService.create.mockResolvedValue(created);

      const result = await controller.create(dto);

      expect(productsService.create).toHaveBeenCalledWith(dto);
      expect(result).toBe(created);
    });
  });

  describe('findAll', () => {
    it('treats a request with no user as a non-admin', async () => {
      const products = [ProductDto.fromEntity(buildProduct())];
      productsService.findAll.mockResolvedValue(products);

      const result = await controller.findAll({}, undefined);

      expect(productsService.findAll).toHaveBeenCalledWith(undefined, false);
      expect(result).toBe(products);
    });

    it('passes the requested status and admin flag for an admin user', async () => {
      productsService.findAll.mockResolvedValue([]);
      const admin: AuthUser = {
        userId: faker.string.uuid(),
        email: faker.internet.email(),
        role: RoleName.ADMIN,
      };

      await controller.findAll({ status: ProductStatusFilter.ALL }, admin);

      expect(productsService.findAll).toHaveBeenCalledWith(
        ProductStatusFilter.ALL,
        true,
      );
    });

    it('reports a non-admin user as not an admin', async () => {
      productsService.findAll.mockResolvedValue([]);
      const customer: AuthUser = {
        userId: faker.string.uuid(),
        email: faker.internet.email(),
        role: RoleName.CUSTOMER,
      };

      await controller.findAll({}, customer);

      expect(productsService.findAll).toHaveBeenCalledWith(undefined, false);
    });
  });

  describe('findOne', () => {
    it('delegates to the service with the admin flag resolved from the user', async () => {
      const product = ProductDto.fromEntity(buildProduct());
      productsService.findOne.mockResolvedValue(product);
      const admin: AuthUser = {
        userId: faker.string.uuid(),
        email: faker.internet.email(),
        role: RoleName.ADMIN,
      };

      const result = await controller.findOne(product.id, admin);

      expect(productsService.findOne).toHaveBeenCalledWith(product.id, true);
      expect(result).toBe(product);
    });
  });

  describe('update', () => {
    it('delegates the update to the service', async () => {
      const id = faker.string.uuid();
      const dto: UpdateProductDto = {
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        price: 20,
      };
      const updated = ProductDto.fromEntity(buildProduct({ id }));
      productsService.update.mockResolvedValue(updated);

      const result = await controller.update(id, dto);

      expect(productsService.update).toHaveBeenCalledWith(id, dto);
      expect(result).toBe(updated);
    });
  });

  describe('setActive', () => {
    it('delegates the status change to the service', async () => {
      const id = faker.string.uuid();
      const dto: UpdateProductStatusDto = { active: false };
      const updated = ProductDto.fromEntity(
        buildProduct({ id, isActive: false }),
      );
      productsService.setActive.mockResolvedValue(updated);

      const result = await controller.setActive(id, dto);

      expect(productsService.setActive).toHaveBeenCalledWith(id, dto.active);
      expect(result).toBe(updated);
    });
  });

  describe('delete', () => {
    it('delegates the deletion to the service', async () => {
      const id = faker.string.uuid();
      productsService.delete.mockResolvedValue(undefined);

      await controller.delete(id);

      expect(productsService.delete).toHaveBeenCalledWith(id);
    });
  });

  describe('uploadImage', () => {
    it('delegates the upload to the service', async () => {
      const productId = faker.string.uuid();
      const file = { mimetype: 'image/png' } as Express.Multer.File;
      const imageDto = { id: faker.string.uuid() };
      productsService.uploadImage.mockResolvedValue(imageDto);

      const result = await controller.uploadImage(productId, file);

      expect(productsService.uploadImage).toHaveBeenCalledWith(productId, file);
      expect(result).toBe(imageDto);
    });
  });

  describe('deleteImage', () => {
    it('delegates the deletion to the service', async () => {
      const productId = faker.string.uuid();
      const imageId = faker.string.uuid();
      productsService.deleteImage.mockResolvedValue(undefined);

      await controller.deleteImage(productId, imageId);

      expect(productsService.deleteImage).toHaveBeenCalledWith(
        productId,
        imageId,
      );
    });
  });

  describe('getImage', () => {
    it('streams the image resolved by the service', async () => {
      const productId = faker.string.uuid();
      const imageId = faker.string.uuid();
      const stream = new Readable();
      productsService.streamImage.mockResolvedValue({
        stream,
        mimeType: 'image/png',
      });
      const admin: AuthUser = {
        userId: faker.string.uuid(),
        email: faker.internet.email(),
        role: RoleName.ADMIN,
      };

      const result = await controller.getImage(productId, imageId, admin);

      expect(productsService.streamImage).toHaveBeenCalledWith(
        productId,
        imageId,
        true,
      );
      expect(result).toBeInstanceOf(StreamableFile);
      expect(result.getStream()).toBe(stream);
      expect(result.getHeaders().type).toBe('image/png');
    });
  });
});
