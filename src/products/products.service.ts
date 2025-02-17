import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FindProductsDto } from './dto/find-products.dto';
import { CategoriesService } from '../categories/categories.service';

@Injectable()
export class ProductsService {
  private readonly categoryFormatRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    private categoriesService: CategoriesService,
  ) {}

  async create(
    createProductDto: CreateProductDto,
  ): Promise<{ message: string; data: ProductDocument }> {
    if (createProductDto.categories?.length) {
      await Promise.all(
        createProductDto.categories.map(async (categoryId) => {
          // چک کردن فرمت
          const category = await this.categoriesService.findOne(categoryId);

          if (!this.categoryFormatRegex.test(category.name)) {
            throw new HttpException(
              {
                status: HttpStatus.BAD_REQUEST,
                error: 'Invalid category format',
                message:
                  'Category names must be lowercase, hyphen-separated words (e.g., "hot-drinks")',
                example: 'hot-drinks, iced-coffee, pastries',
              },
              HttpStatus.BAD_REQUEST,
            );
          }

          const allowedCategories = [
            'hot-drinks',
            'cold-drinks',
            'pastries',
            'desserts',
          ];
          if (!allowedCategories.includes(category.name)) {
            throw new HttpException(
              {
                status: HttpStatus.BAD_REQUEST,
                error: 'Invalid category',
                message: 'Category must be one of the allowed categories',
                allowedCategories,
              },
              HttpStatus.BAD_REQUEST,
            );
          }
        }),
      );
    }

    const createdProduct = new this.productModel(createProductDto);
    const savedProduct = await createdProduct.save();
    return { message: '', data: savedProduct };
  }

  async findAll(query: FindProductsDto) {
    const { page = 1, limit = 10, category } = query;
    const skip = (page - 1) * limit;

    let filterQuery = {};

    if (category) {
      // پیدا کردن کتگوری با نام (slug)
      const categoryDoc = await this.categoriesService.findBySlug(category);
      if (categoryDoc) {
        filterQuery = { categories: categoryDoc._id };
      }
    }

    const [items, total] = await Promise.all([
      this.productModel
        .find(filterQuery)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.productModel.countDocuments(filterQuery),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<ProductDocument> {
    const product = await this.productModel
      .findById(id)
      .populate('categories', 'name description image')
      .exec();

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
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
