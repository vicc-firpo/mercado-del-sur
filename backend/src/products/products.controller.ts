import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthUser } from '../auth/jwt-payload.interface';
import { RoleName } from '../users/enums/role-name.enum';
import { CreateProductDto } from './dto/create-product.dto';
import { FindProductsQueryDto } from './dto/find-products-query.dto';
import { ImageDto } from './dto/image.dto';
import { ProductDto } from './dto/product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateProductStatusDto } from './dto/update-product-status.dto';
import { InvalidImageFileException } from './exceptions/invalid-image-file.exception';
import { MIME_TYPE_TO_EXTENSION } from './image-mime-types';
import { ProductsService } from './products.service';

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN)
  create(@Body() dto: CreateProductDto): Promise<ProductDto> {
    return this.productsService.create(dto);
  }

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  findAll(
    @Query() query: FindProductsQueryDto,
    @CurrentUser() user: AuthUser | undefined,
  ): Promise<ProductDto[]> {
    return this.productsService.findAll(
      query.status,
      user?.role === RoleName.ADMIN,
      query.search,
    );
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser | undefined,
  ): Promise<ProductDto> {
    return this.productsService.findOne(id, user?.role === RoleName.ADMIN);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
  ): Promise<ProductDto> {
    return this.productsService.update(id, dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN)
  setActive(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductStatusDto,
  ): Promise<ProductDto> {
    return this.productsService.setActive(id, dto.active);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.productsService.delete(id);
  }

  @Post(':productId/images')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN)
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN)
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
