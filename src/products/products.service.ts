import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FindProductsDto } from './dto/find-products.dto';
import { CategoriesService } from '../categories/categories.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    private readonly categoriesService: CategoriesService,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<ProductDocument> {
    if (createProductDto.categories?.length) {
      await Promise.all(
        createProductDto.categories.map((categoryId) =>
          this.categoriesService.findOne(categoryId),
        ),
      );
    }

    const createdProduct = new this.productModel(createProductDto);
    return createdProduct.save();
  }

  async findAll(query?: FindProductsDto) {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      minPrice,
      maxPrice,
    } = query || {};

    const skip = (page - 1) * limit;
    const filter: Record<string, any> = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) {
      filter.categories = new Types.ObjectId(category);
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {
        ...(minPrice !== undefined && { $gte: minPrice }),
        ...(maxPrice !== undefined && { $lte: maxPrice }),
      };
    }

    const [items, total] = await Promise.all([
      this.productModel
        .find(filter)
        .populate('categories', 'name description image')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.productModel.countDocuments(filter),
    ]);

    const mappedItems = items.map((product) => {
      const productObj = product.toObject();
      return {
        ...productObj,
        id: product._id.toString(),
        image: `/products/${product._id.toString()}/image`,
      };
    });

    return {
      items: mappedItems,
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
}
