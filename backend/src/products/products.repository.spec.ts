import { DataSource, SelectQueryBuilder } from 'typeorm';
import { faker } from '@faker-js/faker';
import { buildImage } from '../test/factories/image.factory';
import { buildProduct } from '../test/factories/product.factory';
import { Product } from './entities/product.entity';
import { ImagesRepository } from './images.repository';
import { ProductsRepository } from './products.repository';

const stubDataSource = {
  createEntityManager: () => ({}),
} as unknown as DataSource;

type QueryBuilderMock = {
  leftJoinAndSelect: jest.Mock;
  orderBy: jest.Mock;
  andWhere: jest.Mock;
  getMany: jest.Mock;
};

describe('ProductsRepository', () => {
  let repository: ProductsRepository;
  let queryBuilder: QueryBuilderMock;
  let createQueryBuilder: jest.SpyInstance;

  beforeEach(() => {
    repository = new ProductsRepository(stubDataSource);
    queryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    };
    createQueryBuilder = jest
      .spyOn(repository, 'createQueryBuilder')
      .mockReturnValue(queryBuilder as unknown as SelectQueryBuilder<Product>);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('search', () => {
    it('joins images and orders by creation date', async () => {
      await repository.search({});

      expect(createQueryBuilder).toHaveBeenCalledWith('product');
      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'product.images',
        'image',
      );
      expect(queryBuilder.orderBy).toHaveBeenCalledWith(
        'product.createdAt',
        'ASC',
      );
    });

    it('filters by active state when activeFilter is true', async () => {
      await repository.search({ activeFilter: true });

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'product.isActive = :isActive',
        { isActive: true },
      );
    });

    it('filters by inactive state when activeFilter is false', async () => {
      await repository.search({ activeFilter: false });

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'product.isActive = :isActive',
        { isActive: false },
      );
    });

    it('does not filter by active state when activeFilter is undefined', async () => {
      await repository.search({});

      expect(queryBuilder.andWhere).not.toHaveBeenCalledWith(
        'product.isActive = :isActive',
        expect.anything(),
      );
    });

    it('adds an accent-insensitive name/description filter for a term', async () => {
      await repository.search({ term: 'Sofá' });

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('unaccent(product.name) ILIKE unaccent(:like)'),
        { like: '%Sofá%' },
      );
    });

    it('escapes LIKE wildcards in the term', async () => {
      await repository.search({ term: '50% off_er\\' });

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('unaccent'),
        { like: '%50\\% off\\_er\\\\%' },
      );
    });

    it('ignores an empty term', async () => {
      await repository.search({ term: '' });

      expect(queryBuilder.andWhere).not.toHaveBeenCalledWith(
        expect.stringContaining('ILIKE'),
        expect.anything(),
      );
    });

    it('returns the rows produced by the query', async () => {
      const products = [buildProduct(), buildProduct()];
      queryBuilder.getMany.mockResolvedValue(products);

      await expect(repository.search({})).resolves.toBe(products);
    });
  });

  describe('findOneWithImages', () => {
    it('looks the product up by id with its images', async () => {
      const product = buildProduct();
      const findOne = jest
        .spyOn(repository, 'findOne')
        .mockResolvedValue(product);

      await expect(repository.findOneWithImages(product.id)).resolves.toBe(
        product,
      );
      expect(findOne).toHaveBeenCalledWith({
        where: { id: product.id },
        relations: { images: true },
      });
    });
  });
});

describe('ImagesRepository', () => {
  let repository: ImagesRepository;

  beforeEach(() => {
    repository = new ImagesRepository(stubDataSource);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('findOneWithProduct', () => {
    it('scopes the lookup to the image id and its product', async () => {
      const productId = faker.string.uuid();
      const image = buildImage({ productId });
      const findOne = jest
        .spyOn(repository, 'findOne')
        .mockResolvedValue(image);

      await expect(
        repository.findOneWithProduct(productId, image.id),
      ).resolves.toBe(image);
      expect(findOne).toHaveBeenCalledWith({
        where: { id: image.id, productId },
        relations: { product: true },
      });
    });
  });
});
