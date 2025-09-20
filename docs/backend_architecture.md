# ReportesMtto Backend Architecture

This document describes the backend architecture of the ReportesMtto application.

## Directory Structure

```
src/
├── app.js                 # Application setup and composition
├── config/                # Configuration files
├── controllers/           # Route handlers
├── database/              # Database connection and utilities
├── middleware/            # Custom middleware
├── models/                # Database models
├── routes/                # Route definitions
├── services/              # Business logic
├── utils/                 # Utility functions
└── validations/           # Input validations
```

## Architecture Overview

### 1. Entry Point (`server.js`)
The main entry point that creates and starts the application.

### 2. Application Setup (`app.js`)
Configures the Express application, including:
- Middleware setup
- Route registration
- Error handling
- Service initialization

### 3. Configuration (`config/`)
Manages application configuration through environment variables and the `config/index.js` file.

### 4. Routes (`routes/`)
Defines API endpoints and registers controller handlers. Each resource has its own route file:
- `auth.js` - Authentication routes
- `users.js` - User management routes
- `equipment.js` - Equipment routes
- `reports.js` - Report management routes
- `files.js` - File upload/download routes
- `dashboard.js` - Dashboard routes
- `profile.js` - User profile routes

### 5. Controllers (`controllers/`)
Handles HTTP requests and responses. Controllers should:
- Validate request data
- Call appropriate services
- Format responses
- Handle errors

### 6. Services (`services/`)
Contains business logic and acts as an intermediary between controllers and models. Services should:
- Implement business rules
- Handle data transformations
- Manage transactions
- Coordinate between different models if needed

### 7. Models (`models/`)
Defines database schema and relationships using Sequelize. Models should:
- Define data structure
- Implement model associations
- Provide model-specific methods

### 8. Database (`database/`)
Handles database connection and utilities.

### 9. Middleware (`middleware/`)
Custom Express middleware for authentication, error handling, etc.

### 10. Utilities (`utils/`)
Common utility functions used across the application.

### 11. Validations (`validations/`)
Input validation middleware and functions.

## Best Practices

1. **Separation of Concerns**: Each layer has a specific responsibility.
2. **Modularity**: Code is organized in modules by feature.
3. **Reusability**: Services and utilities can be reused across controllers.
4. **Maintainability**: Changes to one layer don't significantly impact others.
5. **Scalability**: New features can be added with minimal disruption.