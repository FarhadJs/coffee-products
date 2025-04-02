# Coffee ACE API <img src="./ace.png" style="width:50px;" />

A NestJS-based REST API for managing coffee ace.

## Features

- Product management (CRUD operations)
- Category management
- User authentication and authorization
- Role-based access control
- Image upload and management
- Pagination and filtering
- Docker support

## Prerequisites

- Git
- npm
- nodejs
- NestJS

## Installation

1. Clone the repository:

```bash
git clone <acecoffee-repo-url>
cd coffee-products
```

2. Create .env file:

```bash
cp .env.example .env
```

3. Start the application:

```bash
npm run start:prod
```

##### The API will be available at http://localhost:3000

<hr />

### API Documentation

#### Authentication

- POST /auth/register - Register new user
- POST /auth/login - Login user
- GET /auth/profile - Get user profile
- PATCH /auth/profile - Update user profile

#### Products

- GET /products - List all products
- GET /products/:id - Get single product
- POST /products - Create new product
- PATCH /products/:id - Update product
- DELETE /products/:id - Delete product
- GET /products/search - Search products
- GET /products/price-range - Filter by price range

#### Categories

- GET /categories - List all categories
- GET /categories/:id - Get single category
- POST /categories - Create new category
- PATCH /categories/:id - Update category
- DELETE /categories/:id - Delete category

#### Users

- GET /users - List all users
- GET /users/:id - Get single user
- POST /users - Create new user
- PATCH /users/:id - Update user
- DELETE /users/:id - Delete user

#### Memories

- GET /memories - List all memories
- GET /memories/admin - List all memories (admin view)
- POST /memories - Create new memory
- PATCH /memories/:id - Approve memory
- DELETE /memories/:id - Delete memory

#### Announcements

- GET /announcements - List all announcements
- POST /announcements - Create new announcement
- DELETE /announcements/:id - Delete announcement

<hr />

## Development

##### To run the application in development mode:

```bash
npm run start:dev
```

### Testing

#### unit tests

```bash
npm run test
```

#### e2e tests

```bash
npm run test:e2e
```

#### test coverage

```bash
npm run test:cov
```

# License

#### MIT licensed
