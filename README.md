# Coffee Products API

A NestJS-based REST API for managing coffee products.

## Features

- Product management (CRUD operations)
- Category management
- User authentication and authorization
- Role-based access control
- Image upload and management
- Pagination and filtering
- Docker support

## Prerequisites

- Docker
- Docker Compose
- Git

## Installation

1. Clone the repository:

```bash
git clone <your-repo-url>
cd coffee-products

    Create .env file:

cp .env.example .env

    Start the application:

docker-compose up -d

The API will be available at http://localhost:3000
API Documentation
Authentication

    POST /auth/register - Register new user
    POST /auth/login - Login user

Products

    GET /products - List all products
    GET /products/:id - Get single product
    POST /products - Create new product
    PATCH /products/:id - Update product
    DELETE /products/:id - Delete product
    GET /products/search - Search products
    GET /products/price-range - Filter by price range

Categories

    GET /categories - List all categories
    GET /categories/:id - Get single category
    POST /categories - Create new category
    PATCH /categories/:id - Update category
    DELETE /categories/:id - Delete category

Development

To run the application in development mode:

docker-compose up

Testing

# unit tests
docker-compose exec api npm run test

# e2e tests
docker-compose exec api npm run test:e2e

# test coverage
docker-compose exec api npm run test:cov

License

MIT licensed
