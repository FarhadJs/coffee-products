// import { Types } from 'mongoose';

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
  _id: string;
  name: string;
  description?: string;
  price: number;
  imagePath: string;
  categories: string[];
  ingredients: string[];
  isActive: boolean;
}
