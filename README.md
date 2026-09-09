# Product Management System

## Features

- Product CRUD
- Category CRUD
- Product search
- Category filter
- Pagination
- Product image upload
- Product status management
- Validation with Zod
- Redis caching
- Swagger API documentation
- Docker support

## Tech Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Axios

### Backend

- Node.js
- Express.js
- TypeScript
- Sequelize
- MySQL
- Redis
- Zod
- Multer
- Swagger
- Docker

## Project Structure

```txt
product-management
  ├── client/                # Frontend (Next.js)
  │   ├── app/               # Pages & routing
  │   ├── components/        # Reusable UI components
  │   ├── hooks/             # Custom React hooks
  │   ├── lib/               # Helper libraries (axios config, api client)
  │   ├── types/             # TypeScript types/interfaces
  │   ├── utils/             # Utility functions
  │   ├── public/            # Static assets (images, icons)
  │   └── ...config files...
  │
  ├── server/                # Backend (Express.js)
  │   ├── src/
  │   │   ├── config/        # DB, Redis, dotenv configs
  │   │   ├── controllers/   # Handle requests/responses
  │   │   ├── routes/        # API endpoints
  │   │   ├── models/        # Sequelize models
  │   │   ├── services/      # Business logic
  │   │   ├── repositories/  # DB queries abstraction
  │   │   ├── validations/   # Zod schemas
  │   │   ├── middleware/    # Auth, error handling
  │   │   ├── utils/         # Helper functions
  │   │   └── server.ts      # Entry point
  │   ├── dist/              # Compiled JS (after build)
  │   └── logs/              # Log files
  │
  └── docker-compose.yml     # Run client + server together
```

## Installation

1. Clone the repository

```bash
git clone https://github.com/jojo-valentine/product-management.git
cd product-management
```

2. Install dependencies

```bash
cd client
npm install
cd ../server
npm install
```

## Environment Variables

# client/.env

NEXT_PUBLIC_API_URL=http://localhost:4000

# server/.env

PORT=4000
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=
REDIS_URL=redis://localhost:6379

## API Documentation

Swagger UI: http://localhost4000/api-docs/

## Screenshots

## Author

1. Clone the repository

2. Install dependencies

3. Create environment files

   client/.env
   server/.env

4. Copy the variables from:

   client/.env.example
   server/.env.example

5. Run migrations and seeders

```bash
    npx sequelize-cli db:migrate
    npx sequelize-cli db:seed --seed 20260731141000-demo-all.ts
```

ุ6. Start the application
