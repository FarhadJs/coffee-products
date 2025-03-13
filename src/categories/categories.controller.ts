import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  // BadRequestException,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  // Res,
  // NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
// import { Response } from 'express';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { join } from 'path';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';
import fs from 'fs';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FOUNDER, UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
    @UploadedFile() file?: Express.Multer.File,
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

      const categoryData = {
        ...createCategoryDto,
        imagePath: file ? `uploads/${uniqueSuffix}` : '',
      };

      const category = await this.categoriesService.create(categoryData);
      return {
        message: 'دسته بندی با موفقیت ثبت شد',
        data: category,
      };
    }

    const category = await this.categoriesService.create(createCategoryDto);
    return {
      message: 'دسته بندی با موفقیت ثبت شد',
      data: category,
    };
  }

  @Get()
  async findAll() {
    const categories = await this.categoriesService.findAll();
    return categories.map((category) => ({
      ...category.toJSON(),
      image: category.imagePath ? `/${category.imagePath}` : undefined, // Update this line
    }));
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const category = await this.categoriesService.findOne(id);
    return {
      ...category.toJSON(),
      image: category.imagePath ? `/${category.imagePath}` : undefined,
    };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FOUNDER, UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const existingCategory = await this.categoriesService.findOne(id);
    if (!existingCategory) {
      throw new BadRequestException(`Product with ID ${id} not found`);
    }

    if (file) {
      if (existingCategory.imagePath) {
        const previousImagePath = join(
          __dirname,
          '..',
          '..',
          existingCategory.imagePath,
        );
        fs.unlink(previousImagePath, (err) => console.error(err));
      }

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
        ...updateCategoryDto,
        image: file
          ? {
              data: file.buffer,
              contentType: file.mimetype,
              filename: file.filename,
            }
          : undefined,
        imagePath: `uploads/${uniqueSuffix}`,
      };
      const category = await this.categoriesService.update(id, updateData);
      return {
        message: 'دسته بندی با موفقیت ویرایش شد',
        data: category,
      };
    }

    const category = await this.categoriesService.update(id, updateCategoryDto);
    return {
      message: 'دسته بندی با موفقیت ویرایش شد',
      data: category,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FOUNDER)
  async remove(@Param('id') id: string) {
    const category = await this.categoriesService.remove(id);
    return {
      message: 'دسته بندی با موفقیت حذف شد',
      data: {
        ...category.toJSON(),
        image: category.imagePath ? `/${category.imagePath}` : undefined,
      },
    };
  }
}
