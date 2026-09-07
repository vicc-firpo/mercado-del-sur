import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Product } from './entities/product.entity';

export interface SearchProductsOptions {
  activeFilter?: boolean;
  term?: string;
}

@Injectable()
export class ProductsRepository extends Repository<Product> {
  constructor(dataSource: DataSource) {
    super(Product, dataSource.createEntityManager());
  }

  search({ activeFilter, term }: SearchProductsOptions): Promise<Product[]> {
    const queryBuilder = this.createQueryBuilder('product')
      .leftJoinAndSelect('product.images', 'image')
      .orderBy('product.createdAt', 'ASC');

    if (activeFilter !== undefined) {
      queryBuilder.andWhere('product.isActive = :isActive', {
        isActive: activeFilter,
      });
    }

    if (term) {
      const like = `%${term.replace(/[\\%_]/g, '\\$&')}%`;
      queryBuilder.andWhere(
        `(unaccent(product.name) ILIKE unaccent(:like) OR ` +
          `unaccent(coalesce(product.description, '')) ILIKE unaccent(:like))`,
        { like },
      );
    }

    return queryBuilder.getMany();
  }

  findOneWithImages(id: string): Promise<Product | null> {
    return this.findOne({ where: { id }, relations: { images: true } });
  }
}
