import { useState } from 'react';

export type ErrorType = 'error' | 'warning' | 'success' | 'info';

export interface ErrorModalState {
  visible: boolean;
  title: string;
  message: string;
  type: ErrorType;
  onRetry?: () => void;
  retryText?: string;
}

/**
 * Custom hook for handling errors with modal display
 * Provides consistent error handling across the app
 */
export const useErrorHandler = () => {
  const [errorModal, setErrorModal] = useState<ErrorModalState>({
    visible: false,
    title: '',
    message: '',
    type: 'error'
  });

  /**
   * Show an error modal with customizable options
   */
  const showError = (
    title: string,
    message: string,
    type: ErrorType = 'error',
    onRetry?: () => void,
    retryText: string = 'Retry'
  ) => {
    setErrorModal({
      visible: true,
      title,
      message,
      type,
      onRetry,
      retryText
    });
  };

  /**
   * Clear/hide the error modal
   */
  const clearError = () => {
    setErrorModal(prev => ({
      ...prev,
      visible: false
    }));
  };

  /**
   * Handle common API errors with appropriate messages
   */
  const handleApiError = (error: any, customMessage?: string, onRetry?: () => void) => {
    let title = 'Error';
    let message = customMessage || 'An unexpected error occurred.';
    let type: ErrorType = 'error';

    // Handle specific error types
    if (error?.code) {
      switch (error.code) {
        case 'auth/network-request-failed':
        case 'network-error':
        case 'connection-error':
          title = 'Connection Error';
          message = 'Please check your internet connection and try again.';
          type = 'error';
          break;
        case 'auth/too-many-requests':
          title = 'Too Many Attempts';
          message = 'Please wait a moment before trying again.';
          type = 'warning';
          break;
        case 'auth/user-not-found':
          title = 'Account Not Found';
          message = 'No account found with this email address.';
          type = 'warning';
          break;
        case 'auth/wrong-password':
          title = 'Incorrect Password';
          message = 'Please check your password and try again.';
          type = 'warning';
          break;
        case 'auth/invalid-email':
          title = 'Invalid Email';
          message = 'Please enter a valid email address.';
          type = 'warning';
          break;
        case 'auth/user-disabled':
          title = 'Account Disabled';
          message = 'This account has been disabled. Please contact support.';
          type = 'error';
          break;
        default:
          if (error.message) {
            message = error.message;
          }
      }
    } else if (error?.message) {
      message = error.message;
    } else if (typeof error === 'string') {
      message = error;
    }

    // Handle network-related errors
    if (error?.name === 'TypeError' && error?.message?.includes('fetch')) {
      title = 'Connection Error';
      message = 'Unable to connect to server. Please check your internet connection.';
      type = 'error';
    }

    // Handle server errors (5xx status codes)
    if (error?.status && error.status >= 500) {
      title = 'Server Error';
      message = 'Server is temporarily unavailable. Please try again later.';
      type = 'error';
    }

    showError(title, message, type, onRetry);
  };

  /**
   * Show a success message
   */
  const showSuccess = (title: string, message: string) => {
    showError(title, message, 'success');
  };

  /**
   * Show a warning message
   */
  const showWarning = (title: string, message: string) => {
    showError(title, message, 'warning');
  };

  /**
   * Show an info message
   */
  const showInfo = (title: string, message: string) => {
    showError(title, message, 'info');
  };

  /**
   * Wrapper for async operations with automatic error handling
   */
  const withErrorHandling = async <T>(
    operation: () => Promise<T>,
    errorMessage?: string,
    onRetry?: () => void
  ): Promise<T | null> => {
    try {
      return await operation();
    } catch (error) {
      handleApiError(error, errorMessage, onRetry);
      return null;
    }
  };

  return {
    errorModal,
    showError,
    clearError,
    handleApiError,
    showSuccess,
    showWarning,
    showInfo,
    withErrorHandling
  };
};
