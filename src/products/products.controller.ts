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
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createProductDto: CreateProductDto,
  ) {
    if (!file) {
      throw new BadRequestException('Image is required');
    }

    const product = await this.productsService.create({
      ...createProductDto,
      image: {
        data: file.buffer,
        contentType: file.mimetype,
        filename: file.originalname,
      },
    });

    return {
      ...product.toJSON(),
      image: `/products/${product._id}/image`,
    };
  }

  @Get(':id/image')
  async getImage(@Param('id') id: string, @Res() res: Response) {
    const product = await this.productsService.findOne(id);
    if (!product || !product.image) {
      throw new NotFoundException('Image not found');
    }

    res.setHeader('Content-Type', product.image.contentType);
    return res.send(product.image.data);
  }

  @Get()
  async findAll() {
    return this.productsService.findAll();
  }

  @Get('search')
  async search(@Query('name') name: string) {
    return this.productsService.findByName(name);
  }

  @Get('price-range')
  async findByPriceRange(@Query('min') min: number, @Query('max') max: number) {
    return this.productsService.findByPriceRange(min, max);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      updateProductDto.image = {
        data: file.buffer,
        contentType: file.mimetype,
        filename: file.originalname,
      };
    }

    const updatedProduct = await this.productsService.update(
      id,
      updateProductDto,
    );

    return {
      ...updatedProduct.toJSON(),
      image: `/products/${updatedProduct._id}/image`,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
