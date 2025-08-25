import { AlertModal } from '@/components/AlertModal';
import { useAuth } from '@/contexts/AuthContext';
import { useUserData } from '@/contexts/UserDataContext';
import React from 'react';

export const NetworkErrorModal: React.FC = () => {
  const { networkError, clearNetworkError, refreshUserData } = useUserData();
  const { user } = useAuth();

  const handleRetry = async () => {
    clearNetworkError();
    if (user) {
      await refreshUserData(user.uid);
    }
  };

  const handleDismiss = () => {
    clearNetworkError();
  };

  return (
    <AlertModal
      visible={networkError.visible}
      title="Connection Error"
      message={networkError.message}
      type="error"
      primaryButton={{
        text: "Retry",
        onPress: handleRetry
      }}
      secondaryButton={{
        text: "Dismiss",
        onPress: handleDismiss
      }}
      onClose={handleDismiss}
    />
  );
};
