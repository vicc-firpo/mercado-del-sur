import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartModule } from '../cart/cart.module';
import { Image } from './entities/image.entity';
import { Product } from './entities/product.entity';
import { ImagesRepository } from './images.repository';
import { ProductsController } from './products.controller';
import { ProductsRepository } from './products.repository';
import { ProductsService } from './products.service';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Image]), CartModule],
  controllers: [ProductsController],
  providers: [ProductsService, ProductsRepository, ImagesRepository],
  exports: [ProductsService],
})
export class ProductsModule {}
