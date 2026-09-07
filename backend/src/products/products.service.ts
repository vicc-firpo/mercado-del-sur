import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { createReadStream, promises as fsPromises } from 'fs';
import { join } from 'path';
import { Readable } from 'stream';
import { DataSource } from 'typeorm';
import { CartService } from '../cart/cart.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductStatusFilter } from './dto/find-products-query.dto';
import { ImageDto } from './dto/image.dto';
import { ProductDto } from './dto/product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Image } from './entities/image.entity';
import { Product } from './entities/product.entity';
import { ImageExtension } from './enums/image-extension.enum';
import { ImageNotFoundException } from './exceptions/image-not-found.exception';
import { InvalidImageFileException } from './exceptions/invalid-image-file.exception';
import { ProductNotFoundException } from './exceptions/product-not-found.exception';
import { ImagesRepository } from './images.repository';
import {
  EXTENSION_TO_MIME_TYPE,
  MIME_TYPE_TO_EXTENSION,
} from './image-mime-types';
import { ProductsRepository } from './products.repository';

const IMAGES_DIR = join(process.cwd(), 'data', 'images');

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly imagesRepository: ImagesRepository,
    private readonly cartService: CartService,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateProductDto): Promise<ProductDto> {
    const product = this.productsRepository.create({
      name: dto.name,
      description: dto.description,
      price: dto.price.toFixed(2),
      isActive: dto.active ?? true,
    });
    return ProductDto.fromEntity(await this.productsRepository.save(product));
  }

  async findAll(
    status?: ProductStatusFilter,
    isAdmin = false,
    search?: string,
  ): Promise<ProductDto[]> {
    const wantsInactive =
      status === ProductStatusFilter.ALL ||
      status === ProductStatusFilter.INACTIVE;
    if (wantsInactive && !isAdmin) {
      throw new ForbiddenException(
        'Admin role required to view inactive products',
      );
    }

    const activeFilter =
      status === ProductStatusFilter.ALL
        ? undefined
        : status !== ProductStatusFilter.INACTIVE;

    const products = await this.productsRepository.search({
      activeFilter,
      term: search?.trim(),
    });
    return products.map((product) => ProductDto.fromEntity(product));
  }

  async findOne(id: string, isAdmin = false): Promise<ProductDto> {
    const product = await this.getOrFail(id);
    if (!product.isActive && !isAdmin) {
      throw new ProductNotFoundException(id);
    }
    return ProductDto.fromEntity(product);
  }

  async update(id: string, dto: UpdateProductDto): Promise<ProductDto> {
    const product = await this.getOrFail(id);
    product.name = dto.name;
    product.description = dto.description;
    product.price = dto.price.toFixed(2);
    return ProductDto.fromEntity(await this.productsRepository.save(product));
  }

  async setActive(id: string, active: boolean): Promise<ProductDto> {
    const product = await this.getOrFail(id);
    if (product.isActive === active) {
      return ProductDto.fromEntity(product);
    }

    product.isActive = active;
    if (active) {
      await this.productsRepository.save(product);
    } else {
      await this.dataSource.transaction(async (manager) => {
        await manager.update(Product, id, { isActive: false });
        await this.cartService.removeProductFromAllCarts(id, manager);
      });
    }

    return ProductDto.fromEntity(product);
  }

  async delete(id: string): Promise<void> {
    const result = await this.productsRepository.delete(id);
    if (!result.affected) {
      throw new ProductNotFoundException(id);
    }
  }

  async uploadImage(
    productId: string,
    file: Express.Multer.File,
  ): Promise<ImageDto> {
    await this.getOrFail(productId);

    if (!file) {
      throw new InvalidImageFileException('An image file is required');
    }
    const extension = MIME_TYPE_TO_EXTENSION[file.mimetype];
    if (!extension) {
      throw new InvalidImageFileException(
        `Unsupported file type: ${file.mimetype}`,
      );
    }

    const image = await this.imagesRepository.save(
      this.imagesRepository.create({ extension, productId }),
    );

    try {
      await this.writeImageFile(image.id, image.extension, file.buffer);
    } catch (err) {
      await this.imagesRepository.delete(image.id);
      throw err;
    }

    return ImageDto.fromEntity(image);
  }

  async deleteImage(productId: string, imageId: string): Promise<void> {
    const image = await this.getImageOrFail(productId, imageId);
    await this.imagesRepository.delete(image.id);
    await this.deleteImageFile(image.id, image.extension);
  }

  async streamImage(
    productId: string,
    imageId: string,
  ): Promise<{ stream: Readable; mimeType: string }> {
    const image = await this.getImageOrFail(productId, imageId);
    const filePath = this.getImagePath(image.id, image.extension);
    try {
      await fsPromises.access(filePath);
    } catch {
      throw new ImageNotFoundException(imageId);
    }
    return {
      stream: createReadStream(filePath),
      mimeType: EXTENSION_TO_MIME_TYPE[image.extension],
    };
  }

  private async getOrFail(id: string): Promise<Product> {
    const product = await this.productsRepository.findOneWithImages(id);
    if (!product) {
      throw new ProductNotFoundException(id);
    }
    return product;
  }

  private async getImageOrFail(
    productId: string,
    imageId: string,
  ): Promise<Image> {
    const image = await this.imagesRepository.findOneWithProduct(
      productId,
      imageId,
    );
    if (!image) {
      throw new ImageNotFoundException(imageId);
    }
    return image;
  }

  private getImagePath(id: string, extension: ImageExtension): string {
    return join(IMAGES_DIR, `${id}.${extension}`);
  }

  private async writeImageFile(
    id: string,
    extension: ImageExtension,
    buffer: Buffer,
  ): Promise<void> {
    await fsPromises.mkdir(IMAGES_DIR, { recursive: true });
    await fsPromises.writeFile(this.getImagePath(id, extension), buffer);
  }

  private async deleteImageFile(
    id: string,
    extension: ImageExtension,
  ): Promise<void> {
    try {
      await fsPromises.unlink(this.getImagePath(id, extension));
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
        this.logger.warn(
          `Failed to delete image file for ${id}: ${(err as Error).message}`,
        );
      }
    }
  }
}
