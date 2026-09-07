import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Image } from './entities/image.entity';

@Injectable()
export class ImagesRepository extends Repository<Image> {
  constructor(dataSource: DataSource) {
    super(Image, dataSource.createEntityManager());
  }

  findOneWithProduct(
    productId: string,
    imageId: string,
  ): Promise<Image | null> {
    return this.findOne({
      where: { id: imageId, productId },
      relations: { product: true },
    });
  }
}
