import { Colors, Typography } from '@/themes/theme';
import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface DeleteAccountModalProps {
  visible: boolean;
  isLoading: boolean;
  error: string | null;
  onConfirm: (password: string) => void;
  onCancel: () => void;
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  visible,
  isLoading,
  error,
  onConfirm,
  onCancel,
}) => {
  const [password, setPassword] = useState('');

  const handleConfirm = () => {
    onConfirm(password);
  };

  const handleCancel = () => {
    setPassword('');
    onCancel();
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <MaterialCommunityIcons name="alert" size={32} color="#FFB23F" />
            <Text style={styles.title}>Confirm Password</Text>
          </View>

          <Text style={styles.message}>
            For security reasons, please enter your password to confirm account deletion.
          </Text>

          <TextInput
            style={[styles.input, error && styles.inputError]}
            placeholder="Enter your password"
            placeholderTextColor={Colors.text + '80'}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
          />

          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleCancel}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.deleteButton]}
              onPress={handleConfirm}
              disabled={isLoading || !password}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Deleting...' : 'Delete Account'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '85%',
    backgroundColor: Colors.bgGameDark,
    borderRadius: 20,
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontFamily: Typography.fontFamily,
    color: Colors.text,
    marginLeft: 12,
  },
  message: {
    fontSize: 16,
    color: Colors.text,
    opacity: 0.8,
    marginBottom: 20,
    lineHeight: 22,
    fontFamily: Typography.fontFamily,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    color: Colors.text,
    fontSize: 16,
    fontFamily: Typography.fontFamily,
    marginBottom: 8,
  },
  inputError: {
    borderWidth: 1,
    borderColor: '#FF4B4B',
  },
  errorText: {
    color: '#FF4B4B',
    fontSize: 14,
    marginBottom: 16,
    fontFamily: Typography.fontFamily,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  deleteButton: {
    backgroundColor: '#FF4B4B',
  },
  buttonText: {
    color: Colors.text,
    fontSize: 16,
    fontFamily: Typography.fontFamily,
  },
});
