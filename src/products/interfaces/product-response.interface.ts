import { Types } from 'mongoose';

export interface PaginatedResponse<T> {
  items: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface ProductResponse {
  id: string;
  name: string;
  description?: string;
  price: number;
  imagePath: string;
  categories: Types.ObjectId[];
  ingredients: string[];
  isActive: boolean;
}
