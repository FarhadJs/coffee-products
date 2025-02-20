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
    const productData = {
      ...createProductDto,
      image: file
        ? { data: file.buffer, contentType: file.mimetype }
        : undefined,
      imagePath: file ? `uploads/${file.filename}` : '',
    };

    const product = await this.productsService.create(productData);
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
        imagePth: `uploads/${product.imagePath}`,
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
    const updateData = {
      ...updateProductDto,
      image: file
        ? { data: file.buffer, contentType: file.mimetype }
        : undefined,
      imagePath: file ? `uploads/${file.filename}` : '',
    };

    const updatedProduct = await this.productsService.update(id, updateData);
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
