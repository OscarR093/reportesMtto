# Frontend Migration Guide

This document provides guidance on how to migrate from the old frontend structure to the new, more sustainable architecture.

## Overview of Changes

We've restructured the frontend to improve maintainability, scalability, and organization. Here's what we've done:

1. **Service Layer**: Created API services for centralized API interactions
2. **Component Organization**: Better categorization of components
3. **Constants**: Centralized application constants
4. **Configuration**: Environment-based configuration management
5. **Custom Hooks**: Reusable hooks for common functionality
6. **Routing**: Improved route management with guards

## Migration Steps

### 1. Update Dependencies

Ensure all dependencies are up to date by running:
```bash
npm install
```

### 2. Replace the Auth Hook

Replace the old `useAuth.jsx` with the new version:
```bash
mv src/hooks/useAuth.jsx src/hooks/useAuth_old.jsx
mv src/hooks/useAuth_new.jsx src/hooks/useAuth.jsx
```

### 3. Replace the App Component

Replace the old `App.jsx` with the new version:
```bash
mv src/App.jsx src/App_old.jsx
mv src/App_new.jsx src/App.jsx
```

### 4. Update API Calls in Components

Replace direct fetch calls with service calls. For example:

**Old:**
```javascript
const response = await fetch('http://localhost:3000/api/dashboard', {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});
```

**New:**
```javascript
import dashboardService from '../services/dashboardService';

const response = await dashboardService.getDashboardData();
```

### 5. Use New Components

Replace custom UI elements with the new reusable components:

**Old:**
```javascript
<button className="btn-primary">Click me</button>
```

**New:**
```javascript
import Button from '../components/common/Button';

<Button variant="primary">Click me</Button>
```

### 6. Use Constants

Replace hardcoded values with constants:

**Old:**
```javascript
if (priority === 'alta') {
  // ...
}
```

**New:**
```javascript
import { PRIORITY_LEVELS } from '../constants/app';

if (priority === PRIORITY_LEVELS.ALTA) {
  // ...
}
```

## Benefits of the New Structure

1. **Modularity**: Each feature is now in its own well-organized directory
2. **Maintainability**: Changes to one part of the system won't affect others
3. **Scalability**: Adding new features is now much simpler
4. **Code Reusability**: Components and services can be reused across the application
5. **Consistent Error Handling**: Centralized error handling in services
6. **Better Type Safety**: Improved structure for future TypeScript migration

## Next Steps

1. **Complete Migration**: Update all components to use the new service layer
2. **Add Unit Tests**: Write tests for services and utility functions
3. **Enhance Error Handling**: Implement more comprehensive error handling
4. **Add Loading States**: Implement consistent loading states across components
5. **Documentation**: Continue updating documentation as the codebase evolves

## Rollback Plan

If issues arise, you can rollback to the previous structure:
1. Restore the original files from backups
2. Revert the import path changes
3. Restart the development server

The old files have been renamed with an `_old` suffix to preserve them during the transition.