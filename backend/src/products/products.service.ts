import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductDto } from './dto/product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { ProductNotFoundException } from './exceptions/product-not-found.exception';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  async create(dto: CreateProductDto): Promise<ProductDto> {
    const product = this.productsRepository.create({
      name: dto.name,
      price: dto.price.toFixed(2),
      currency: dto.currency,
    });
    return ProductDto.fromEntity(await this.productsRepository.save(product));
  }

  async findAll(): Promise<ProductDto[]> {
    const products = await this.productsRepository.find({
      order: { createdAt: 'ASC' },
    });
    return products.map((product) => ProductDto.fromEntity(product));
  }

  async findOne(id: string): Promise<ProductDto> {
    return ProductDto.fromEntity(await this.getOrFail(id));
  }

  async update(id: string, dto: UpdateProductDto): Promise<ProductDto> {
    const product = await this.getOrFail(id);
    product.name = dto.name;
    product.price = dto.price.toFixed(2);
    product.currency = dto.currency;
    return ProductDto.fromEntity(await this.productsRepository.save(product));
  }

  async delete(id: string): Promise<void> {
    const result = await this.productsRepository.delete(id);
    if (!result.affected) {
      throw new ProductNotFoundException(id);
    }
  }

  private async getOrFail(id: string): Promise<Product> {
    const product = await this.productsRepository.findOne({ where: { id } });
    if (!product) {
      throw new ProductNotFoundException(id);
    }
    return product;
  }
}
