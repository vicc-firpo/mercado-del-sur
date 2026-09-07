import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Image } from './entities/image.entity';
import { Product } from './entities/product.entity';
import { ImagesRepository } from './images.repository';
import { ProductsController } from './products.controller';
import { ProductsRepository } from './products.repository';
import { ProductsService } from './products.service';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Image])],
  controllers: [ProductsController],
  providers: [ProductsService, ProductsRepository, ImagesRepository],
  exports: [ProductsService],
})
export class ProductsModule {}
