import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  BadRequestException,
  UseInterceptors,
  UploadedFile,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

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
    if (!createCategoryDto.slug) {
      throw new BadRequestException('دسته بندی باید در یک گروه اسمی تعریف شود');
    }

    const categoryData = {
      ...createCategoryDto,
      image: file
        ? {
            data: file.buffer,
            contentType: file.mimetype,
            filename: file.originalname,
          }
        : undefined,
    };

    const category = await this.categoriesService.create(categoryData);
    return {
      message: 'دسته بندی با موفقیت ثبت شد',
      data: {
        ...category.toJSON(),
        image: category.image ? `/categories/${category._id}/image` : undefined,
      },
    };
  }

  @Get(':id/image')
  async getImage(@Param('id') id: string, @Res() res: Response) {
    const category = await this.categoriesService.findOne(id);
    if (!category?.image?.data) {
      throw new NotFoundException('Image not found');
    }

    res.setHeader('Content-Type', category.image.contentType);
    return res.send(category.image.data);
  }

  @Get()
  async findAll() {
    const categories = await this.categoriesService.findAll();
    return categories.map((category) => ({
      ...category.toJSON(),
      image: category.image ? `/categories/${category._id}/image` : undefined,
    }));
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const category = await this.categoriesService.findOne(id);
    return {
      ...category.toJSON(),
      image: category.image ? `/categories/${category._id}/image` : undefined,
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
    const updateData = {
      ...updateCategoryDto,
      image: file
        ? {
            data: file.buffer,
            contentType: file.mimetype,
            filename: file.originalname,
          }
        : undefined,
    };

    const category = await this.categoriesService.update(id, updateData);
    return {
      message: 'دسته بندی با موفقیت آپدیت شد',
      data: {
        ...category.toJSON(),
        image: category.image ? `/categories/${category._id}/image` : undefined,
      },
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
        image: category.image ? `/categories/${category._id}/image` : undefined,
      },
    };
  }
}
