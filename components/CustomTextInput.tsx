import React from 'react';
import { TextInput as RNTextInput, TextInputProps } from 'react-native';

/**
 * Custom TextInput component that prevents automatic font scaling from system accessibility settings.
 * This ensures consistent input field sizing across all devices regardless of user's font size preferences.
 */
export const TextInput = React.forwardRef<RNTextInput, TextInputProps>(
  ({ allowFontScaling = false, ...props }, ref) => {
    return <RNTextInput ref={ref} allowFontScaling={allowFontScaling} {...props} />;
  }
);

TextInput.displayName = 'TextInput';
