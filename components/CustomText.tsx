import React from 'react';
import { Text as RNText, TextProps } from 'react-native';

/**
 * Custom Text component that prevents automatic font scaling from system accessibility settings.
 * This ensures consistent UI across all devices regardless of user's font size preferences.
 */
export const Text: React.FC<TextProps> = ({ allowFontScaling = false, ...props }) => {
  return <RNText allowFontScaling={allowFontScaling} {...props} />;
};
