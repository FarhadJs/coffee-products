import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FindProductsDto } from './dto/find-products.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
// import { CategoriesService } from '../categories/categories.service';
import {
  PaginatedResponse,
  ProductResponse,
} from './interfaces/product-response.interface';
import { join } from 'path';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';
import fs from 'fs';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Roles(UserRole.FOUNDER, UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
    }),
  )
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createProductDto: CreateProductDto,
  ) {
    if (file) {
      const validMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!validMimeTypes.includes(file.mimetype)) {
        throw new BadRequestException(
          'Invalid file type. Only JPEG, PNG, and GIF are allowed.',
        );
      }

      const uniqueSuffix = uuidv4() + extname(file.originalname);
      const outputFilePath = join(
        __dirname,
        '..',
        '..',
        'uploads',
        `${uniqueSuffix}`,
      );

      // compress the file
      await sharp(file.buffer)
        .resize(800)
        .toFormat('jpeg', { quality: 80 })
        .toFile(outputFilePath);

      if (
        isNaN(Number(createProductDto.price)) &&
        isNaN(Number(createProductDto.discount))
      ) {
        throw new BadRequestException(
          'قیمت و تخفیف باید به صورت عدد وارد کنید',
        );
      }

      const productData = {
        ...createProductDto,
        imagePath: file ? `uploads/${uniqueSuffix}` : '',
        price: isNaN(Number(createProductDto.price))
          ? 0
          : Number(createProductDto.price),
        discount: isNaN(Number(createProductDto.discount))
          ? 0
          : Number(createProductDto.discount),
      };

      const product = await this.productsService.create(productData);
      return {
        message: 'محصول با موفقیت ثبت شد',
        data: product,
      };
    }

    if (
      isNaN(Number(createProductDto.price)) &&
      isNaN(Number(createProductDto.discount))
    ) {
      throw new BadRequestException('قیمت و تخفیف باید به صورت عدد وارد کنید');
    }

    const product = await this.productsService.create(createProductDto);
    return {
      message: 'محصول با موفقیت ثبت شد',
      data: product,
    };
  }

  @Get()
  @Roles(UserRole.FOUNDER, UserRole.ADMIN, UserRole.STAFF, UserRole.USER)
  async findAll(
    @Query() query: FindProductsDto,
  ): Promise<PaginatedResponse<ProductResponse>> {
    const { items, meta } = await this.productsService.findAll(query);

    return {
      items: items.map((product) => ({
        _id: product._id.toString(),
        name: product.name,
        description: product.description,
        price: product.price,
        discount: product.discount,
        imagePath: product.imagePath || '',
        categories: product.categories,
        ingredients: product.ingredients,
        isActive: product.isActive,
      })),
      meta,
    };
  }

  @Get('search')
  @Roles(UserRole.FOUNDER, UserRole.ADMIN, UserRole.STAFF, UserRole.USER)
  async search(@Query('name') name: string, @Query() query: FindProductsDto) {
    if (!name) {
      throw new BadRequestException('Name parameter is required');
    }
    const products = await this.productsService.findByName(name, query);
    return {
      message: 'products',
      data: products,
    };
  }

  @Get('price-range')
  @Roles(UserRole.FOUNDER, UserRole.ADMIN, UserRole.STAFF, UserRole.USER)
  async findByPriceRange(
    @Query('min', ParseIntPipe) min: number,
    @Query('max', ParseIntPipe) max: number,
  ) {
    if (min > max) {
      throw new BadRequestException(
        'Min price cannot be greater than max price',
      );
    }
    const products = await this.productsService.findByPriceRange(min, max);
    return products.map((product) => ({
      ...product.toJSON(),
      id: product._id.toString(),
      imagePath: `uploads/${product.imagePath}`,
    }));
  }

  @Get(':id')
  @Roles(UserRole.FOUNDER, UserRole.ADMIN, UserRole.STAFF, UserRole.USER)
  async findOne(@Param('id') id: string) {
    const product = await this.productsService.findOne(id);
    return {
      ...product.toJSON(),
      image: `uploads/${product.imagePath}`,
    };
  }

  @Patch(':id')
  @Roles(UserRole.FOUNDER, UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const existingProduct = await this.productsService.findOne(id);
    if (!existingProduct) {
      throw new BadRequestException(`Product with ID ${id} not found`);
    }

    if (existingProduct.imagePath) {
      const previousImagePath = join(
        __dirname,
        '..',
        '..',
        existingProduct.imagePath,
      );
      try {
        fs.unlinkSync(previousImagePath);
      } catch (error) {
        console.error(`Failed to delete previous image: ${error}`);
      }
    }

    if (file) {
      const validMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!validMimeTypes.includes(file.mimetype)) {
        throw new BadRequestException(
          'Invalid file type. Only JPEG, PNG, and GIF are allowed.',
        );
      }

      const uniqueSuffix = uuidv4() + extname(file.originalname);
      const outputFilePath = join(
        __dirname,
        '..',
        '..',
        'uploads',
        `${uniqueSuffix}`,
      );

      // compress the file
      await sharp(file.buffer)
        .resize(800)
        .toFormat('jpeg', { quality: 80 })
        .toFile(outputFilePath);

      const updateData = {
        ...updateProductDto,
        image: file
          ? { data: file.buffer, contentType: file.mimetype }
          : undefined,
        imagePath: `uploads/${uniqueSuffix}`,
      };

      if (
        isNaN(Number(updateProductDto.price)) &&
        isNaN(Number(updateProductDto.discount))
      ) {
        throw new BadRequestException(
          'قیمت و تخفیف باید به صورت عدد وارد کنید',
        );
      }

      const updatedProduct = await this.productsService.update(id, updateData);
      return {
        message: 'محصول با موفقیت ویرایش شد',
        data: updatedProduct,
      };
    }

    if (
      isNaN(Number(updateProductDto.price)) &&
      isNaN(Number(updateProductDto.discount))
    ) {
      throw new BadRequestException('قیمت و تخفیف باید به صورت عدد وارد کنید');
    }

    const updatedProduct = await this.productsService.update(
      id,
      updateProductDto,
    );
    return {
      message: 'محصول با موفقیت ویرایش شد',
      data: updatedProduct,
    };
  }

  @Delete(':id')
  @Roles(UserRole.FOUNDER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async remove(@Param('id') id: string) {
    const deletedProduct = await this.productsService.remove(id);
    return {
      message: 'محصول با موفقیت حذف شد',
      ...deletedProduct.toJSON(),
      id: deletedProduct._id.toString(),
    };
  }
}
