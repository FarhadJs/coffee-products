// src/categories/categories.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
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
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    return {
      message: 'دسته بندی با موفقیت ثبت شد',
      data: await this.categoriesService.create(createCategoryDto),
    };
  }

  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.categoriesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FOUNDER, UserRole.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return {
      message: 'دسته بندی با موفقیت آپدیت شد',
      data: await this.categoriesService.update(id, updateCategoryDto),
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FOUNDER)
  async remove(@Param('id') id: string) {
    return {
      message: 'دسته بندی با موفقیت حذف شد',
      data: await this.categoriesService.remove(id),
    };
  }
}
