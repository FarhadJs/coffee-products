# Coffee Shop API Documentation

## Base URL

```plaintext
http://your-server-url:3000
```

## Endpoints

### 1. Get All Products

```typescript
GET /products

Response: {
  _id: string;
  product_name: string;
  price: number;
  product_details: string;
  image: string; // URL format: /products/{product_id}/image
  createdAt: string;
  updatedAt: string;
}[]
```

### 2. Get Single Product

```typescript
GET /products/:id

Response: {
  _id: string;
  product_name: string;
  price: number;
  product_details: string;
  image: string;
  createdAt: string;
  updatedAt: string;
}
```

### 3. Create Product

```typescript
POST /products
Content-Type: multipart/form-data

Body:
{
  product_name: string;
  price: number;
  product_details: string;
  image: File; // Required
}
```

### 4. Update Product

```typescript
PATCH /products/:id
Content-Type: multipart/form-data

Body:
{
  product_name?: string;
  price?: number;
  product_details?: string;
  image?: File; // Optional
}
```

### 5. Delete Product

```typescript
DELETE /products/:id
```

### 6. Search Products

```typescript
GET /products/search?name=:searchTerm

Response: Product[]
```

### 7. Filter by Price Range

```typescript
GET /products/price-range?min=:minPrice&max=:maxPrice

Response: Product[]
```

## Important Notes

1. **Image Handling**:
   - Images are stored in MongoDB
   - Access images via `/products/:id/image`
   - Maximum image size: 16MB
   - Supported formats: JPEG, PNG, WebP

2. **TypeScript Interfaces**:

```typescript
interface Product {
  _id: string;
  product_name: string;
  price: number;
  product_details: string;
  image: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateProductDTO {
  product_name: string;
  price: number;
  product_details: string;
  image: File;
}

interface UpdateProductDTO {
  product_name?: string;
  price?: number;
  product_details?: string;
  image?: File;
}
```

1. **Error Handling**:

```typescript
{
  statusCode: number;
  message: string;
  error: string;
}
```

1. **Example Usage with Axios**:

```typescript
// Get all products
const getProducts = async () => {
  const response = await axios.get('http://your-server:3000/products');
  return response.data;
};

// Create product
const createProduct = async (formData: FormData) => {
  const response = await axios.post('http://your-server:3000/products', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Update product
const updateProduct = async (id: string, formData: FormData) => {
  const response = await axios.patch(`http://your-server:3000/products/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Delete product
const deleteProduct = async (id: string) => {
  await axios.delete(`http://your-server:3000/products/${id}`);
};
```

1. **CORS**:

- API allows requests from all origins in development
- Configure specific origins in production

1. **Rate Limiting**:

- No rate limiting implemented yet
- Plan accordingly for production use

1. **Image Best Practices**:

```typescript
// Image loading with error handling
<img
  src={`http://your-server:3000${product.image}`}
  alt={product.product_name}
  onError={(e) => {
    e.currentTarget.src = '/placeholder.jpg';
  }}
  loading="lazy"
/>
```

1. **Environment Variables**:

```typescript
// .env
VITE_API_URL=http://your-server:3000

// usage
const API_URL = import.meta.env.VITE_API_URL;

```
