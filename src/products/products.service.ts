import {
  BadRequestException,
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

  async create(createProductDto: CreateProductDto): Promise<ProductDocument> {
    // اول چک می‌کنیم که آیا همه دسته‌بندی‌ها وجود دارند
    const categoryIds: string[] = [];
    for (const categoryName of createProductDto.categories!) {
      try {
        const category = await this.categoriesService.findBySlug(categoryName);
        categoryIds.push(category._id);
      } catch (error) {
        throw new BadRequestException(
          `Category "${categoryName}" not found\n` + error,
        );
      }
    }

    // حالا محصول رو با ObjectId های دسته‌بندی‌ها می‌سازیم
    const product = await this.productModel.create({
      ...createProductDto,
      categories: categoryIds,
    });

    return product;
  }
  // ... سایر متدها

  async findAll(query: FindProductsDto) {
    const { page = 1, limit = 10, category } = query;
    const skip = (page - 1) * limit;

    let filterQuery = {};

    if (category) {
      try {
        // پیدا کردن کتگوری با slug
        const categoryDoc = await this.categoriesService.findBySlug(category);
        if (categoryDoc) {
          filterQuery = { categories: { $in: [categoryDoc._id] } };
        }
      } catch (error) {
        if (error instanceof NotFoundException) {
          // اگر کتگوری پیدا نشد، آرایه خالی برمی‌گردانیم
          return {
            items: [],
            meta: {
              total: 0,
              page,
              limit,
              pages: 0,
            },
          };
        }
        throw error;
      }
    }

    const [items, total] = await Promise.all([
      this.productModel
        .find(filterQuery)
        .populate('categories', 'name slug description')
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
