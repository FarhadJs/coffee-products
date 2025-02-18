import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FindProductsDto } from './dto/find-products.dto';
import { CategoriesService } from '../categories/categories.service';
import { PaginatedResponse } from './interfaces/product-response.interface';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    private categoriesService: CategoriesService,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<ProductDocument> {
    const categoryIds: Types.ObjectId[] = [];

    for (const categoryName of createProductDto.categories!) {
      const category = await this.categoriesService.findBySlug(categoryName);
      if (!Types.ObjectId.isValid(category._id)) {
        throw new BadRequestException(`Invalid category ID: ${category._id}`);
      }
      categoryIds.push(new Types.ObjectId(category._id));
    }

    const product = await this.productModel.create({
      ...createProductDto,
      categories: categoryIds,
      imagePath: createProductDto.imagePath, // Ensure imagePath is saved
    });

    return product;
  }

  async findAll(
    query: FindProductsDto,
  ): Promise<PaginatedResponse<ProductDocument>> {
    const { page = 1, limit = 10 } = query; // تعیین مقادیر پیش‌فرض
    const products = await this.productModel
      .find()
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();
    const total = await this.productModel.countDocuments();

    return {
      items: products,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<ProductDocument> {
    const product = await this.productModel.findById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async findByName(name: string): Promise<ProductDocument[]> {
    return this.productModel
      .find({ name: { $regex: name, $options: 'i' } })
      .populate('categories', 'name description image')
      .exec();
  }

  async findByPriceRange(
    minPrice: number,
    maxPrice: number,
  ): Promise<ProductDocument[]> {
    return this.productModel
      .find({
        price: {
          $gte: minPrice,
          $lte: maxPrice,
        },
      })
      .populate('categories', 'name description image')
      .exec();
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<ProductDocument> {
    if (updateProductDto.categories?.length) {
      await Promise.all(
        updateProductDto.categories.map((categoryId) =>
          this.categoriesService.findOne(categoryId),
        ),
      );
    }

    const updatedProduct = await this.productModel
      .findByIdAndUpdate(id, updateProductDto, { new: true })
      .populate('categories', 'name description image')
      .exec();

    if (!updatedProduct) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return updatedProduct;
  }

  async remove(id: string): Promise<ProductDocument> {
    const deletedProduct = await this.productModel.findByIdAndDelete(id).exec();

    if (!deletedProduct) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return deletedProduct;
  }
}
