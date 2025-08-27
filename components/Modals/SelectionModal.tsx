import { Colors, Typography } from '@/themes/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface SelectionOption {
  label: string;
  value: number;
  description?: string;
}

interface SelectionModalProps {
  visible: boolean;
  title: string;
  options: SelectionOption[];
  onSelect: (value: number) => void;
  onClose: () => void;
  currentValue?: number;
}

export const SelectionModal: React.FC<SelectionModalProps> = ({
  visible,
  title,
  options,
  onSelect,
  onClose,
  currentValue,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false}>
            {options.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionItem,
                  currentValue === option.value && styles.selectedOption
                ]}
                onPress={() => {
                  onSelect(option.value);
                  onClose();
                }}
              >
                <View style={styles.optionContent}>
                  <Text style={[
                    styles.optionLabel,
                    currentValue === option.value && styles.selectedText
                  ]}>
                    {option.label}
                  </Text>
                  {option.description && (
                    <Text style={[
                      styles.optionDescription,
                      currentValue === option.value && styles.selectedDescription
                    ]}>
                      {option.description}
                    </Text>
                  )}
                </View>
                {currentValue === option.value && (
                  <MaterialCommunityIcons 
                    name="check-circle" 
                    size={24} 
                    color="#fdd700" 
                  />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#1b1b1bff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    borderWidth: 1,
    borderColor: '#c5c5c593',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    color: Colors.text,
    fontSize: 18,
    fontFamily: Typography.fontFamily,
    fontWeight: '600',
  },
  closeButton: {
    padding: 5,
  },
  optionsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 10,
    marginVertical: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedOption: {
    backgroundColor: 'rgba(253, 215, 0, 0.1)',
    borderColor: '#fdd700',
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    color: Colors.text,
    fontSize: 16,
    fontFamily: Typography.fontFamily,
    fontWeight: '500',
  },
  selectedText: {
    color: '#fdd700',
  },
  optionDescription: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    fontFamily: Typography.fontFamily,
    marginTop: 4,
  },
  selectedDescription: {
    color: 'rgba(253, 215, 0, 0.8)',
  },
});
