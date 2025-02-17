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
  Res,
  NotFoundException,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FindProductsDto } from './dto/find-products.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import {
  PaginatedResponse,
  ProductResponse,
} from './interfaces/product-response.interface';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Roles(UserRole.FOUNDER, UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createProductDto: CreateProductDto,
  ) {
    if (!file) {
      throw new BadRequestException('Image is required');
    }

    const productData = {
      ...createProductDto,
      image: {
        data: file.buffer,
        contentType: file.mimetype,
        filename: file.originalname,
      },
    };

    const product = await this.productsService.create(productData);
    return {
      ...product.toJSON(),
      id: product._id.toString(),
      image: `/products/${product._id.toString()}/image`,
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
        id: product._id.toString(),
        name: product.name,
        description: product.description,
        price: product.price,
        image: `/products/${product._id.toString()}/image`,
        categories: product.categories,
        ingredients: product.ingredients,
        isActive: product.isActive,
      })),
      meta,
    };
  }

  @Get(':id/image')
  @Roles(UserRole.FOUNDER, UserRole.ADMIN, UserRole.STAFF, UserRole.USER)
  async getImage(@Param('id') id: string, @Res() res: Response) {
    const product = await this.productsService.findOne(id);
    if (!product?.image?.data) {
      throw new NotFoundException('Image not found');
    }

    res.setHeader('Content-Type', product.image.contentType);
    return res.send(product.image.data);
  }

  @Get('search')
  @Roles(UserRole.FOUNDER, UserRole.ADMIN, UserRole.STAFF, UserRole.USER)
  async search(@Query('name') name: string) {
    if (!name) {
      throw new BadRequestException('Name parameter is required');
    }
    const products = await this.productsService.findByName(name);
    return {
      message: 'products',
      data: products.map((product) => ({
        ...product.toJSON(),
        id: product._id.toString(),
        image: `/products/${product._id.toString()}/image`,
      })),
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
      image: `/products/${product._id.toString()}/image`,
    }));
  }

  @Get(':id')
  @Roles(UserRole.FOUNDER, UserRole.ADMIN, UserRole.STAFF, UserRole.USER)
  async findOne(@Param('id') id: string) {
    const product = await this.productsService.findOne(id);
    return {
      ...product.toJSON(),
      id: product._id.toString(),
      image: `/products/${product._id.toString()}/image`,
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
    const updateData = { ...updateProductDto };

    if (file) {
      updateData.image = {
        data: file.buffer,
        contentType: file.mimetype,
        filename: file.originalname,
      };
    }

    const updatedProduct = await this.productsService.update(id, updateData);
    return {
      ...updatedProduct.toJSON(),
      id: updatedProduct._id.toString(),
      image: `/products/${updatedProduct._id.toString()}/image`,
    };
  }

  @Delete(':id')
  @Roles(UserRole.FOUNDER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async remove(@Param('id') id: string) {
    const deletedProduct = await this.productsService.remove(id);
    return {
      ...deletedProduct.toJSON(),
      id: deletedProduct._id.toString(),
    };
  }
}
