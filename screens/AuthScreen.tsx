import { Text, TextInput } from '@/components';
import { AlertModal } from '@/components/Modals/AlertModal';
import { useAuth } from '@/contexts/AuthContext';
import { Colors, Typography } from '@/themes/theme';
import { uiScale } from '@/utils/uiScale';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useRef, useState } from 'react';
import type { TextInput as RNTextInput } from 'react-native';
import {
    ActivityIndicator,
    Image,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    useWindowDimensions,
    View,
} from 'react-native';

export default function AuthScreen() {
  const { width } = useWindowDimensions();
  const isSmallPhone = width < 360;
  const inputMinHeight = isSmallPhone ? 48 : 52;
  const inputFontSize = isSmallPhone ? uiScale(16, { category: 'font' }) : uiScale(18, { category: 'font' });
  const iconSize = isSmallPhone ? uiScale(22, { category: 'icon' }) : uiScale(24, { category: 'icon' });

  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
  const [passwordResetMessage, setPasswordResetMessage] = useState('');
  const [passwordResetType, setPasswordResetType] = useState<'success' | 'error'>('success');
  const { login, register, resetPassword } = useAuth();

  const nameRef = useRef<RNTextInput>(null);
  const emailRef = useRef<RNTextInput>(null);
  const passwordRef = useRef<RNTextInput>(null);
  const confirmPasswordRef = useRef<RNTextInput>(null);

  const handleSubmit = async () => {
    setError('');
    setIsSubmitting(true);

    try {
      if (!isLogin) {
        // Basic validation for registration
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          return;
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters');
          return;
        }
      }
      const result = isLogin
        ? await login(email, password)
        : await register(email, password, name);

      if (!result.success && result.error) {
        setError(result.error.code);
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <SafeAreaView style={{ flex: 1, alignSelf: 'stretch' }}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <Image
              source={require('@/assets/images/img2.png')}
              style={{ width: uiScale(160, { category: 'icon' }), height: uiScale(160, { category: 'icon' }), marginBottom: uiScale(20, { category: 'spacing' }) }} />
            <View style={styles.form}>
              {!isLogin && (
                <View style={[styles.inputContainer, { minHeight: inputMinHeight }]}>
                  <MaterialCommunityIcons name="account-outline" size={iconSize} color={Colors.lightgray} style={styles.inputIcon} />
                  <TextInput
                    ref={nameRef}
                    style={[styles.input, { fontSize: inputFontSize, minHeight: inputMinHeight }]}
                    placeholder="Full Name"
                    placeholderTextColor={Colors.lightgray}
                    value={name}
                    onChangeText={(text) => setName(text.slice(0, 50))}
                    autoCapitalize="words"
                    maxLength={30}
                    returnKeyType="next"
                    onSubmitEditing={() => emailRef.current?.focus()}
                    accessibilityLabel="Full name"
                  />
                </View>
              )}
              <View style={[styles.inputContainer, { minHeight: inputMinHeight }]}>
                <MaterialCommunityIcons name="email-outline" size={iconSize} color={Colors.lightgray} style={styles.inputIcon} />
                <TextInput
                  ref={emailRef}
                  style={[styles.input, { fontSize: inputFontSize, minHeight: inputMinHeight }]}
                  placeholder="Email"
                  placeholderTextColor={Colors.lightgray}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoCorrect={false}
                  textContentType="emailAddress"
                  returnKeyType="next"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                  accessibilityLabel="Email address"
                />
              </View>
              <View style={[styles.inputContainer, { minHeight: inputMinHeight }]}>
                <MaterialCommunityIcons name="lock-outline" size={iconSize} color={Colors.lightgray} style={styles.inputIcon} />
                <TextInput
                  ref={passwordRef}
                  style={[styles.input, { fontSize: inputFontSize, minHeight: inputMinHeight }]}
                  placeholder="Password"
                  placeholderTextColor={Colors.lightgray}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  textContentType="password"
                  autoCorrect={false}
                  returnKeyType={isLogin ? 'done' : 'next'}
                  onSubmitEditing={() => {
                    if (isLogin) {
                      handleSubmit();
                    } else {
                      confirmPasswordRef.current?.focus();
                    }
                  }}
                  accessibilityLabel="Password"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  accessibilityRole="button"
                  accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                >
                  <MaterialCommunityIcons
                    name={showPassword ? "eye-off" : "eye"}
                    size={iconSize}
                    color={Colors.lightgray}
                  />
                </TouchableOpacity>
              </View>
              {!isLogin && (
                <View style={[styles.inputContainer, { minHeight: inputMinHeight }]}>
                  <MaterialCommunityIcons name="lock-check-outline" size={iconSize} color={Colors.lightgray} style={styles.inputIcon} />
                  <TextInput
                    ref={confirmPasswordRef}
                    style={[styles.input, { fontSize: inputFontSize, minHeight: inputMinHeight }]}
                    placeholder="Confirm Password"
                    placeholderTextColor={Colors.lightgray}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    textContentType="password"
                    autoCorrect={false}
                    returnKeyType="done"
                    onSubmitEditing={handleSubmit}
                    accessibilityLabel="Confirm password"
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    accessibilityRole="button"
                    accessibilityLabel={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    <MaterialCommunityIcons
                      name={showConfirmPassword ? "eye-off" : "eye"}
                      size={iconSize}
                      color={Colors.lightgray}
                    />
                  </TouchableOpacity>
                </View>
              )}
              {error ? (
                <Text style={styles.errorText} numberOfLines={3} adjustsFontSizeToFit minimumFontScale={0.8}>Problem {error}</Text>
              ) : null}

              <TouchableOpacity
                style={[styles.button, isSubmitting && styles.buttonDisabled, { paddingVertical: isSmallPhone ? uiScale(12, { category: 'spacing' }) : uiScale(14, { category: 'spacing' }) }]}
                onPress={handleSubmit}
                disabled={isSubmitting}
                accessibilityRole="button"
                accessibilityLabel={isLogin ? 'Login' : 'Register'}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  {isSubmitting && <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />}
                  <Text style={styles.buttonText} adjustsFontSizeToFit numberOfLines={1}>
                    {isSubmitting ? 'Please wait...' : (isLogin ? 'Login' : 'Register')}
                  </Text>
                </View>
              </TouchableOpacity>

              {isLogin && (
                <TouchableOpacity
                  onPress={async () => {
                    if (!email) {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      setPasswordResetType('error');
                      setPasswordResetMessage('Please enter your email address first');
                      setShowPasswordResetModal(true);
                      return;
                    }
                    try {
                      const result = await resetPassword(email);
                      if (result.success) {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        setPasswordResetType('success');
                        setPasswordResetMessage('Password reset email sent! Check your inbox and follow the instructions to reset your password.');
                        setShowPasswordResetModal(true);
                        setError('');
                      } else if (result.error) {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        setPasswordResetType('error');
                        setPasswordResetMessage(result.error.message || 'Failed to send reset email. Please check your email and try again.');
                        setShowPasswordResetModal(true);
                      }
                    } catch {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      setPasswordResetType('error');
                      setPasswordResetMessage('Failed to send reset email. Please try again.');
                      setShowPasswordResetModal(true);
                    }
                  }}
                >
                  <Text style={styles.forgotPasswordText}>Forgot your password?</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
                disabled={isSubmitting}
              >
                <Text style={styles.switchText}>
                  {isLogin ? 'Create an account?' : 'Have an account? Login'}
                </Text>
              </TouchableOpacity>

              {/* <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>or login with</Text>
          <View style={styles.divider} />
        </View>

        <TouchableOpacity style={styles.socialButton} onPress={() => console.log('Google login')}>
          <MaterialCommunityIcons name="google" size={24} color="#fff" />
          <Text style={styles.socialButtonText}>Google</Text>
        </TouchableOpacity> */}
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </SafeAreaView>

      {/* Password Reset Modal */}
      <AlertModal
        visible={showPasswordResetModal}
        title={passwordResetType === 'success' ? 'Email Sent!' : 'Reset Failed'}
        message={passwordResetMessage}
        type={passwordResetType}
        primaryButton={{
          text: 'OK',
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowPasswordResetModal(false);
          },
        }}
        onClose={() => setShowPasswordResetModal(false)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: uiScale(16, { category: 'spacing' }),
    width: '100%',
    paddingHorizontal: uiScale(12, { category: 'spacing' }), // Increased horizontal padding
  },
  passwordContainer: {
    marginBottom: 15,
  },
  passwordInput: {
    backgroundColor: '#fff',
    padding: uiScale(12, { category: 'spacing' }),
    borderRadius: 8,
    fontSize: uiScale(14, { category: 'font' }),
    paddingRight: 50,
  },
  eyeButton: {
    padding: uiScale(8, { category: 'spacing' }),
    position: 'absolute',
    right: 5,
    top: '50%',
    transform: [{ translateY: -16 }],
  },
  errorText: {
    color: '#ff6b6b',
    fontFamily: Typography.fontFamily,
    fontSize: uiScale(11, { category: 'font' }),
    marginBottom: uiScale(10, { category: 'spacing' }),
    textAlign: 'center',
  },
  title: {
    fontFamily: Typography.fontFamily,
    color: "#fff",
    fontSize: uiScale(36, { category: 'font' }),
    textAlign: 'center',
    marginBottom: uiScale(24, { category: 'spacing' }),
  },
  welcomeText: {
    fontFamily: Typography.fontFamily,
    color: "#fff",
    fontSize: uiScale(18, { category: 'font' }),
    textAlign: 'center',
    marginBottom: uiScale(14, { category: 'spacing' }),
  },
  form: {
    width: '100%',
    minWidth: 0,
    maxWidth: 330, // Increased max width for wider screens
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    marginBottom: uiScale(10, { category: 'spacing' }),
    position: 'relative',
  },
  inputIcon: {
    paddingLeft: uiScale(12, { category: 'spacing' }),
  },
  input: {
    flex: 1,
    color: '#fff',
    padding: uiScale(14, { category: 'spacing' }),
    
    paddingLeft: uiScale(10, { category: 'spacing' }),
    fontSize: uiScale(16, { category: 'font' }),
    width: '100%',
  },
  button: {
    backgroundColor: "#db2020ff",
    paddingHorizontal: uiScale(22, { category: 'spacing' }),
    paddingVertical: uiScale(12, { category: 'spacing' }),
    paddingBottom: uiScale(14, { category: 'spacing' }),
    borderRadius: 8,
    elevation: 11,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    width: '100%',
  },
  buttonDisabled: {
    backgroundColor: Colors.button + '80', // Add 50% opacity
    elevation: 0,
    shadowOpacity: 0,
  },
  buttonText: {
    fontFamily: Typography.fontFamily,
    color: "#fff",
    fontSize: uiScale(18, { category: 'font' }),
    textAlign: 'center',
  },
  switchText: {
    fontFamily: Typography.fontFamily,
    color: '#fff',
    textAlign: 'center',
    marginTop: uiScale(12, { category: 'spacing' }),
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: uiScale(20, { category: 'spacing' }),
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#fff',
    opacity: 0.3,
  },
  dividerText: {
    color: '#fff',
    paddingHorizontal: uiScale(8, { category: 'spacing' }),
    opacity: 0.8,
    fontFamily: Typography.fontFamily,
  },
  socialButton: {
    backgroundColor: '#DB4437',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: uiScale(10, { category: 'spacing' }),
    paddingHorizontal: uiScale(22, { category: 'spacing' }),
    borderRadius: 8,
    gap: 10,
  },
  socialButtonText: {
    color: '#fff',
    fontSize: uiScale(16, { category: 'font' }),
    fontFamily: Typography.fontFamily,
  },
  forgotPasswordText: {
    fontFamily: Typography.fontFamily,
    color: Colors.lightgray,
    textAlign: 'center',
    marginTop: uiScale(8, { category: 'spacing' }),
    marginBottom: uiScale(4, { category: 'spacing' }),
    fontSize: uiScale(13, { category: 'font' }),
  },
});
