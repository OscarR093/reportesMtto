# Migration Guide: ReportesMtto Backend Restructuring

This document provides guidance on how to migrate from the old backend structure to the new, more sustainable architecture.

## Overview of Changes

We've restructured the backend to improve maintainability, scalability, and organization. Here's what we've done:

1. **Route Organization**: Separated routes into individual files by resource
2. **Service Layer**: Created a base service class for common operations
3. **Database Organization**: Moved database-related files to a dedicated directory
4. **Utility Functions**: Created utility directories for common functions
5. **Validation Layer**: Added a validation directory for input validation

## Migration Steps

### 1. Update Import Paths

Several files have been moved to new locations:
- `config/database.js` → `database/connection.js`

Update any imports that reference these files.

### 2. Route Registration

The new route structure is already implemented in `app_refactored.js`. To use it:

1. Replace `app.js` with `app_refactored.js`:
   ```bash
   mv src/app.js src/app_old.js
   mv src/app_refactored.js src/app.js
   ```

2. Ensure all route files in `src/routes/` are properly configured.

### 3. Service Refactoring

We've created refactored versions of services that extend the base service:
- `userService_refactored.js`
- `reportService_refactored.js`

To use these:
1. Replace the original service files:
   ```bash
   mv src/services/userService.js src/services/userService_old.js
   mv src/services/userService_refactored.js src/services/userService.js
   
   mv src/services/reportService.js src/services/reportService_old.js
   mv src/services/reportService_refactored.js src/services/reportService.js
   ```

### 4. Test the Changes

After making these changes:
1. Run the development server: `npm run dev`
2. Test all API endpoints to ensure they work correctly
3. Verify database operations function as expected
4. Check file upload/download functionality

## Benefits of the New Structure

1. **Modularity**: Each resource has its own route file, making it easier to find and modify specific endpoints.
2. **Scalability**: Adding new features is simpler with a well-organized structure.
3. **Maintainability**: Changes to one part of the system are less likely to affect others.
4. **Reusability**: Base service class reduces code duplication.
5. **Testability**: Smaller, focused files are easier to test.

## Next Steps

1. **Complete Service Refactoring**: Extend the base service pattern to other services (authService, equipmentService, etc.)
2. **Add More Validations**: Implement comprehensive input validation for all endpoints
3. **Enhance Error Handling**: Create custom error classes for better error management
4. **Add Unit Tests**: Write tests for services and utility functions
5. **Documentation**: Continue updating documentation as the codebase evolves

## Rollback Plan

If issues arise, you can rollback to the previous structure:
1. Restore the original files from backups
2. Revert the import path changes
3. Restart the development server

The old files have been renamed with an `_old` suffix to preserve them during the transition.