import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateProductDto } from './dto/create-product.dto';
import { ImageDto } from './dto/image.dto';
import { ProductDto } from './dto/product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InvalidImageFileException } from './exceptions/invalid-image-file.exception';
import { MIME_TYPE_TO_EXTENSION } from './image-mime-types';
import { ProductsService } from './products.service';

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(@Body() dto: CreateProductDto): Promise<ProductDto> {
    return this.productsService.create(dto);
  }

  @Get()
  findAll(): Promise<ProductDto[]> {
    return this.productsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ProductDto> {
    return this.productsService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
  ): Promise<ProductDto> {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.productsService.delete(id);
  }

  @Post(':productId/images')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_IMAGE_SIZE_BYTES },
      fileFilter: (_req, file, callback) => {
        if (!MIME_TYPE_TO_EXTENSION[file.mimetype]) {
          callback(
            new InvalidImageFileException(
              `Unsupported file type: ${file.mimetype}`,
            ),
            false,
          );
          return;
        }
        callback(null, true);
      },
    }),
  )
  uploadImage(
    @Param('productId', ParseUUIDPipe) productId: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ImageDto> {
    return this.productsService.uploadImage(productId, file);
  }

  @Delete(':productId/images/:imageId')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteImage(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Param('imageId', ParseUUIDPipe) imageId: string,
  ): Promise<void> {
    return this.productsService.deleteImage(productId, imageId);
  }

  @Get(':productId/images/:imageId')
  async getImage(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Param('imageId', ParseUUIDPipe) imageId: string,
  ): Promise<StreamableFile> {
    const { stream, mimeType } = await this.productsService.streamImage(
      productId,
      imageId,
    );
    return new StreamableFile(stream, { type: mimeType });
  }
}
