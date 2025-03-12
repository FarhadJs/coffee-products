import { ProductImage } from 'src/products/interfaces/product-image.interface';

export interface MemoriesResponse {
  name: string;
  text: string;
  image: ProductImage;
  imagePath: string;
}
