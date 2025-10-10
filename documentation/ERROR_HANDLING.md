# Error Handling Implementation

This document describes the comprehensive error handling system implemented in the Shadow MMA app.

## Components

### 1. Enhanced AuthContext
The `AuthContext` now includes automatic error modal display for authentication-related errors:

- **Features:**
  - Shows error modals for login, register, logout, and password reset operations
  - Handles network errors and server issues
  - Rate limiting protection with user-friendly messages
  - Displays success messages for operations like password reset

- **Usage:**
  ```tsx
  const { login, register, resetPassword, showErrorModal, clearErrorModal } = useAuth();
  
  // Error modals are automatically shown for auth operations
  const result = await login(email, password);
  
  // Manually show error modal if needed
  showErrorModal('Custom Error', 'Something went wrong', 'error');
  ```

### 2. Enhanced UserDataContext
The `UserDataContext` already includes network error handling with modal display:

- **Features:**
  - Automatic retry functionality for network errors
  - User-friendly error messages
  - Graceful handling of API failures

### 3. useErrorHandler Hook
A custom hook that provides consistent error handling across the app:

- **Features:**
  - Standardized error modal management
  - Automatic API error parsing and user-friendly messages
  - Support for retry operations
  - Different error types (error, warning, success, info)

- **Usage:**
  ```tsx
  const { showError, clearError, handleApiError, withErrorHandling } = useErrorHandler();
  
  // Show custom error
  showError('Error Title', 'Error message', 'error');
  
  // Handle API errors automatically
  try {
    await apiCall();
  } catch (error) {
    handleApiError(error, 'Custom message', retryFunction);
  }
  
  // Wrap async operations with automatic error handling
  const result = await withErrorHandling(
    () => fetch('/api/endpoint'),
    'Failed to fetch data',
    retryFunction
  );
  ```

### 4. ErrorBoundary Component
A React Error Boundary that catches JavaScript errors and prevents app crashes:

- **Features:**
  - Catches unhandled React errors
  - Shows user-friendly error messages
  - Allows app recovery without full restart
  - Optional error reporting integration

- **Usage:**
  ```tsx
  <ErrorBoundary
    onError={(error, errorInfo) => {
      // Log to crash reporting service
      console.error('App Error:', error, errorInfo);
    }}
  >
    <App />
  </ErrorBoundary>
  ```

### 5. ErrorModal Component
A reusable modal component that works with the error handling system:

- **Features:**
  - Consistent styling with the app's AlertModal
  - Support for retry operations
  - Different error types with appropriate icons

### 6. ErrorHandlerProvider Component
Higher-order component and provider for centralized error handling:

- **Features:**
  - Wraps components with error handling capabilities
  - Provides error handler functions via props or render props
  - Automatically includes error modal display

## Error Handling Patterns

### 1. Authentication Errors
Already implemented in AuthContext - errors are automatically shown as modals.

### 2. API/Network Errors
```tsx
const { handleApiError } = useErrorHandler();

const fetchData = async () => {
  try {
    const response = await fetch('/api/data');
    if (!response.ok) throw new Error('API Error');
    return await response.json();
  } catch (error) {
    handleApiError(error, 'Failed to load data', () => fetchData());
  }
};
```

### 3. Form Validation Errors
```tsx
const { showWarning } = useErrorHandler();

const validateForm = () => {
  if (!email) {
    showWarning('Validation Error', 'Email is required');
    return false;
  }
  return true;
};
```

### 4. Success Messages
```tsx
const { showSuccess } = useErrorHandler();

const handleSuccess = () => {
  showSuccess('Success!', 'Operation completed successfully');
};
```

## Current Implementation Status

✅ **Completed:**
- Enhanced AuthContext with error modals
- UserDataContext network error handling
- useErrorHandler hook
- ErrorBoundary component
- ErrorModal component
- ErrorHandlerProvider component
- App-wide error boundary integration

✅ **Already Working:**
- Authentication error modals
- Network error handling in UserDataContext
- Individual screen error handling (combos, game)
- Error displays in existing screens

## Usage Examples

### Basic Error Handling
```tsx
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { ErrorModal } from '@/components/Modals/ErrorModal';

const MyComponent = () => {
  const { errorModal, clearError, handleApiError } = useErrorHandler();
  
  const loadData = async () => {
    try {
      const data = await apiCall();
    } catch (error) {
      handleApiError(error, 'Failed to load data');
    }
  };
  
  return (
    <View>
      {/* Your component content */}
      <ErrorModal
        errorModal={errorModal}
        onClear={clearError}
        onRetry={loadData}
      />
    </View>
  );
};
```

### Using Higher-Order Component
```tsx
import { withErrorHandling, WithErrorHandlingProps } from '@/components/ErrorHandlerProvider';

const MyComponent = ({ errorHandler }: WithErrorHandlingProps) => {
  const handleError = () => {
    errorHandler.showError('Error', 'Something went wrong');
  };
  
  return <View>{/* Your component content */}</View>;
};

export default withErrorHandling(MyComponent);
```

### Using Provider Pattern
```tsx
import { ErrorHandlerProvider } from '@/components/ErrorHandlerProvider';

const MyScreen = () => {
  return (
    <ErrorHandlerProvider>
      {(errorHandler) => (
        <View>
          {/* Your screen content */}
          <Button
            title="Test Error"
            onPress={() => errorHandler.showError('Test', 'This is a test error')}
          />
        </View>
      )}
    </ErrorHandlerProvider>
  );
};
```

## Best Practices

1. **Use the AuthContext for authentication errors** - These are automatically handled
2. **Use useErrorHandler for API and business logic errors**
3. **Use ErrorBoundary to catch unexpected JavaScript errors**
4. **Provide retry functionality for network-related errors**
5. **Show success messages for important user actions**
6. **Use appropriate error types (error, warning, success, info)**
7. **Provide clear, user-friendly error messages**

## Benefits

- **Consistent UX:** All errors are displayed in a consistent modal format
- **Better User Experience:** Clear error messages with retry options
- **Crash Prevention:** Error boundary prevents app crashes
- **Developer Experience:** Easy-to-use hooks and components
- **Maintainability:** Centralized error handling logic
- **Extensibility:** Easy to add new error types and handling patterns
