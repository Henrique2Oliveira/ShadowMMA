import React from 'react';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { ErrorModal } from './Modals/ErrorModal';

/**
 * Higher-order component that adds error handling capabilities to any component
 * Provides an error modal and error handling functions via props
 */
export interface WithErrorHandlingProps {
  errorHandler: ReturnType<typeof useErrorHandler>;
}

export function withErrorHandling<P extends object>(
  WrappedComponent: React.ComponentType<P>
): React.ComponentType<Omit<P, keyof WithErrorHandlingProps>> {
  return function WithErrorHandlingComponent(props: Omit<P, keyof WithErrorHandlingProps>) {
    const errorHandler = useErrorHandler();

    return (
      <>
        <WrappedComponent
          {...(props as P)}
          errorHandler={errorHandler}
        />
        <ErrorModal
          errorModal={errorHandler.errorModal}
          onClear={errorHandler.clearError}
        />
      </>
    );
  };
}

/**
 * React component that provides error handling context to its children
 * Use this to wrap components that need centralized error handling
 */
export const ErrorHandlerProvider: React.FC<{
  children: (errorHandler: ReturnType<typeof useErrorHandler>) => React.ReactNode;
}> = ({ children }) => {
  const errorHandler = useErrorHandler();

  return (
    <>
      {children(errorHandler)}
      <ErrorModal
        errorModal={errorHandler.errorModal}
        onClear={errorHandler.clearError}
      />
    </>
  );
};
