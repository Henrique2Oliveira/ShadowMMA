import { ErrorModal } from '@/components/Modals/ErrorModal';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { Colors, Typography } from '@/themes/theme';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

/**
 * Demo component showing how to use the new error handling system
 * This component demonstrates various error types and scenarios
 */
export const ErrorHandlingDemo: React.FC = () => {
  const { errorModal, clearError, showError, showSuccess, showWarning, showInfo, handleApiError, withErrorHandling } = useErrorHandler();

  const simulateNetworkError = () => {
    const networkError = {
      code: 'network-error',
      message: 'Network request failed'
    };
    handleApiError(networkError, 'Failed to connect to server', () => {
      showSuccess('Retry Success', 'Connection restored!');
    });
  };

  const simulateAuthError = () => {
    const authError = {
      code: 'auth/wrong-password',
      message: 'The password is invalid'
    };
    handleApiError(authError);
  };

  const simulateServerError = () => {
    const serverError = {
      status: 500,
      message: 'Internal server error'
    };
    handleApiError(serverError, 'Server is experiencing issues');
  };

  const simulateApiCallWithErrorHandling = async () => {
    const result = await withErrorHandling(
      async () => {
        // Simulate an API call that fails
        throw new Error('API call failed');
      },
      'Failed to fetch data from server',
      () => showInfo('Retry', 'Retrying the operation...')
    );

    if (result) {
      showSuccess('Success', 'Data loaded successfully!');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Error Handling Demo</Text>
      <Text style={styles.subtitle}>Test different error scenarios:</Text>

      <TouchableOpacity
        style={[styles.button, styles.errorButton]}
        onPress={() => showError('Custom Error', 'This is a custom error message')}
      >
        <Text style={styles.buttonText}>Show Error</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.warningButton]}
        onPress={() => showWarning('Warning', 'This is a warning message')}
      >
        <Text style={styles.buttonText}>Show Warning</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.successButton]}
        onPress={() => showSuccess('Success', 'This is a success message')}
      >
        <Text style={styles.buttonText}>Show Success</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.infoButton]}
        onPress={() => showInfo('Information', 'This is an info message')}
      >
        <Text style={styles.buttonText}>Show Info</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.networkButton]}
        onPress={simulateNetworkError}
      >
        <Text style={styles.buttonText}>Simulate Network Error</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.authButton]}
        onPress={simulateAuthError}
      >
        <Text style={styles.buttonText}>Simulate Auth Error</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.serverButton]}
        onPress={simulateServerError}
      >
        <Text style={styles.buttonText}>Simulate Server Error</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.apiButton]}
        onPress={simulateApiCallWithErrorHandling}
      >
        <Text style={styles.buttonText}>Test API with Error Handling</Text>
      </TouchableOpacity>

      <ErrorModal
        errorModal={errorModal}
        onClear={clearError}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 24,
    fontFamily: Typography.fontFamily,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: Typography.fontFamily,
    color: Colors.lightgray,
    textAlign: 'center',
    marginBottom: 30,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    marginVertical: 5,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontFamily: Typography.fontFamily,
    color: Colors.text,
    fontWeight: 'bold',
  },
  errorButton: {
    backgroundColor: '#FF4B4B',
  },
  warningButton: {
    backgroundColor: '#FFB23F',
  },
  successButton: {
    backgroundColor: '#4CAF50',
  },
  infoButton: {
    backgroundColor: '#2196F3',
  },
  networkButton: {
    backgroundColor: '#9C27B0',
  },
  authButton: {
    backgroundColor: '#FF5722',
  },
  serverButton: {
    backgroundColor: '#795548',
  },
  apiButton: {
    backgroundColor: '#607D8B',
  },
});
