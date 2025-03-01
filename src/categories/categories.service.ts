import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
// import { generateSlug } from '../common/utils/slug.util';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  async create(
    createCategoryDto: CreateCategoryDto,
  ): Promise<CategoryDocument> {
    // Check if slug already exists
    const existingCategory = await this.categoryModel.findOne({
      slug: createCategoryDto.slug,
    });
    if (existingCategory) {
      throw new ConflictException(
        `دسته بندی(${createCategoryDto.slug})قبلاً تعریف شده است!`,
      );
    }

    if (createCategoryDto.slug == '') {
      throw new BadRequestException('slug is required!');
    }

    const category = await this.categoryModel.create({
      ...createCategoryDto,
      imagePath: createCategoryDto.imagePath, // Save the image path
    });

    return category;
  }

  async findAll(): Promise<CategoryDocument[]> {
    return this.categoryModel.find({ isActive: true }).exec();
  }

  async findBySlug(slug: string): Promise<CategoryDocument> {
    const category = await this.categoryModel.findOne({ slug });
    if (!category) {
      throw new NotFoundException(`Category with slug "${slug}" not found`);
    }
    return category;
  }

  async findOne(id: string): Promise<CategoryDocument> {
    const category = await this.categoryModel.findById(id).exec();
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryDocument> {
    if (updateCategoryDto.imagePath == '') delete updateCategoryDto.imagePath;
    const updatedCategory = await this.categoryModel
      .findByIdAndUpdate(id, updateCategoryDto, { new: true })
      .exec();

    if (!updatedCategory) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return updatedCategory;
  }

  async remove(id: string): Promise<CategoryDocument> {
    const deletedCategory = await this.categoryModel
      .findByIdAndDelete(id)
      .exec();

    if (!deletedCategory) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return deletedCategory;
  }
}
