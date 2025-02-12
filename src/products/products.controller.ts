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
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ensureUploadsDirectory } from 'utils/file.utils';
import { extname, join } from 'path';
import { existsSync, unlinkSync } from 'fs';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: (req, file, callback) => {
          const uploadPath = ensureUploadsDirectory();
          callback(null, uploadPath);
        },
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Image is required');
    }

    try {
      // Create the product with image
      const imageUrl = `uploads/${file.filename}`;
      const product = await this.productsService.create({
        ...createProductDto,
        image_url: imageUrl,
      });

      return product;
    } catch (error) {
      // If product creation fails, delete the uploaded file
      if (file) {
        const filePath = join(__dirname, '../../uploads', file.filename);
        if (existsSync(filePath)) {
          unlinkSync(filePath);
        }
      }
      throw error;
    }
  }

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Get('search')
  search(@Query('name') name: string) {
    return this.productsService.findByName(name);
  }

  @Get('price-range')
  findByPriceRange(@Query('min') min: number, @Query('max') max: number) {
    return this.productsService.findByPriceRange(min, max);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: (req, file, callback) => {
          const uploadPath = ensureUploadsDirectory();
          callback(null, uploadPath);
        },
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      // First get the existing product to check for old image
      const existingProduct = await this.productsService.findOne(id);

      if (file) {
        if (existingProduct.image_url) {
          const oldFilePath = join(
            __dirname,
            '../../',
            existingProduct.image_url,
          );
          if (existsSync(oldFilePath)) {
            unlinkSync(oldFilePath);
          }
        }

        const imageUrl = `uploads/${file.filename}`;
        updateProductDto.image_url = imageUrl;
      }
      const updatedProduct = await this.productsService.update(
        id,
        updateProductDto,
      );

      return updatedProduct;
    } catch (error) {
      // If update fails and new file was uploaded, delete it
      if (file) {
        const filePath = join(__dirname, '../../uploads', file.filename);
        if (existsSync(filePath)) {
          unlinkSync(filePath);
        }
      }
      throw error;
    }
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
