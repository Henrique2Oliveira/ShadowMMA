import React from 'react';
import { ErrorModalState } from '../../hooks/useErrorHandler';
import { AlertModal } from './AlertModal';

interface ErrorModalProps {
  errorModal: ErrorModalState;
  onClear: () => void;
  onRetry?: () => void;
}

/**
 * Generic error modal component that works with useErrorHandler hook
 */
export const ErrorModal: React.FC<ErrorModalProps> = ({
  errorModal,
  onClear,
  onRetry
}) => {
  const handleRetry = () => {
    onClear();
    if (errorModal.onRetry) {
      errorModal.onRetry();
    } else if (onRetry) {
      onRetry();
    }
  };

  return (
    <AlertModal
      visible={errorModal.visible}
      title={errorModal.title}
      message={errorModal.message}
      type={errorModal.type}
      primaryButton={{
        text: errorModal.onRetry || onRetry ? (errorModal.retryText || 'Retry') : 'OK',
        onPress: errorModal.onRetry || onRetry ? handleRetry : onClear
      }}
      secondaryButton={
        errorModal.onRetry || onRetry
          ? {
              text: 'Cancel',
              onPress: onClear
            }
          : undefined
      }
      onClose={onClear}
    />
  );
};
