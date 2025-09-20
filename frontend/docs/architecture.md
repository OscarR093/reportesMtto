# ReportesMtto Frontend Architecture

This document describes the frontend architecture of the ReportesMtto application.

## Directory Structure

```
src/
├── assets/                 # Static assets (images, icons, etc.)
├── components/             # Reusable UI components
│   ├── common/             # Generic components (buttons, inputs, etc.)
│   ├── layout/             # Layout components (header, sidebar, etc.)
│   ├── report/             # Report-specific components
│   └── user/               # User-specific components
├── config/                 # Configuration files
├── constants/              # Application constants
├── context/                # React context providers
├── hooks/                  # Custom React hooks
├── pages/                  # Page components
├── routes/                 # Route definitions
├── services/               # API services
├── styles/                 # CSS/Tailwind styles
├── utils/                  # Utility functions
└── App.jsx                 # Main application component
```

## Architecture Overview

### 1. Entry Point (`main.jsx`)
The main entry point that bootstraps the React application.

### 2. Main Application (`App.jsx`)
Configures routing and wraps the application with providers.

### 3. Configuration (`config/`)
Manages application configuration, including API endpoints.

### 4. Constants (`constants/`)
Defines application constants like priority levels, status values, etc.

### 5. Services (`services/`)
Centralized API service layer that handles all HTTP requests.

### 6. Hooks (`hooks/`)
Custom React hooks for common functionality.

### 7. Routes (`routes/`)
Route definitions and guards for protected routes.

### 8. Components (`components/`)
Reusable UI components organized by category.

### 9. Pages (`pages/`)
Page-level components that represent individual views.

### 10. Utilities (`utils/`)
Common utility functions.

## Key Improvements

1. **Service Layer**: Centralized API service for consistent HTTP requests
2. **Component Organization**: Better categorization of components
3. **Consistent State Management**: Improved context structure
4. **Utility Functions**: Centralized utility functions
5. **Constants**: Centralized application constants
6. **Configuration**: Environment-based configuration management
7. **Routing**: Improved route management with guards
8. **Custom Hooks**: Reusable hooks for common functionality

## Best Practices

1. **Separation of Concerns**: Each layer has a specific responsibility
2. **Modularity**: Code is organized in modules by feature
3. **Reusability**: Components and services can be reused across the application
4. **Maintainability**: Changes to one layer don't significantly impact others
5. **Scalability**: New features can be added with minimal disruption