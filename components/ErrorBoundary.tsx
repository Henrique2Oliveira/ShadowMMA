import React from 'react';
import { Alert } from 'react-native';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

/**
 * Error Boundary component to catch and handle React errors
 * Shows a user-friendly error message instead of crashing the app
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error to console (or send to error reporting service)
    console.error('Error Boundary caught an error:', error, errorInfo);
    
    // Call the onError callback if provided
    this.props.onError?.(error, errorInfo);

    // Show a native alert as fallback
    Alert.alert(
      'Something went wrong',
      'An unexpected error occurred. The app will try to recover.',
      [
        {
          text: 'OK',
          onPress: () => this.resetError()
        }
      ]
    );
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // If a custom fallback component is provided, use it
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
      }

      // Default fallback - return null to show nothing (alert will be shown)
      return null;
    }

    return this.props.children;
  }
}

/**
 * Hook version of error boundary for functional components
 * Note: This doesn't actually provide error boundary functionality,
 * but provides a consistent interface for error handling
 */
export const useErrorBoundary = () => {
  const throwError = (error: Error) => {
    throw error;
  };

  const handleError = (error: Error) => {
    console.error('Error caught by useErrorBoundary:', error);
    Alert.alert(
      'Error',
      error.message || 'An unexpected error occurred.',
      [{ text: 'OK' }]
    );
  };

  return {
    throwError,
    handleError
  };
};
