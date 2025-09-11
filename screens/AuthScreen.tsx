import { useAuth } from '@/contexts/AuthContext';
import { Colors, Typography } from '@/themes/theme';
import { uiScale } from '@/utils/uiScale';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, register, resetPassword } = useAuth();

  const handleSubmit = async () => {
    setError('');
    setIsSubmitting(true);

    try {
      const result = isLogin
        ? await login(email, password)
        : await register(email, password, name);

      if (!result.success && result.error) {
        setError(result.error.code);
      }
    } catch (e) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Image
          source={require('@/assets/images/img2.png')}
          style={{ width: uiScale(160, { category: 'icon' }), height: uiScale(160, { category: 'icon' }), marginBottom: uiScale(20, { category: 'spacing' }) }} />
        <View style={styles.form}>
        {!isLogin && (
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="account-outline" size={uiScale(20, { category: 'icon' })} color={Colors.lightgray} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor={Colors.lightgray}
              value={name}
              onChangeText={(text) => setName(text.slice(0, 50))}
              autoCapitalize="words"
              maxLength={50}
            />
          </View>
        )}
        <View style={styles.inputContainer}>
          <MaterialCommunityIcons name="email-outline" size={uiScale(20, { category: 'icon' })} color={Colors.lightgray} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={Colors.lightgray}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />
        </View>
        <View style={styles.inputContainer}>
          <MaterialCommunityIcons name="lock-outline" size={uiScale(20, { category: 'icon' })} color={Colors.lightgray} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={Colors.lightgray}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowPassword(!showPassword)}
          >
            <MaterialCommunityIcons
              name={showPassword ? "eye-off" : "eye"}
              size={uiScale(20, { category: 'icon' })}
              color={Colors.lightgray}
            />
          </TouchableOpacity>
        </View>
        {error ? (
          <Text style={styles.errorText} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.8}>Problem {error}</Text>
        ) : null}

        <TouchableOpacity
          style={[styles.button, isSubmitting && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.buttonText} adjustsFontSizeToFit numberOfLines={1}>
            {isSubmitting ? 'Please wait...' : (isLogin ? 'Login' : 'Register')}
          </Text>
        </TouchableOpacity>

        {isLogin && (
          <TouchableOpacity
            onPress={async () => {
              if (!email) {
                setError('Please enter your email address first');
                return;
              }
              try {
                const result = await resetPassword(email);
                if (result.success) {
                  Alert.alert('Password reset email sent! Check your inbox.');
                  setError('Password reset email sent! Check your inbox.');
                } else if (result.error) {
                  setError(result.error.message);
                }
              } catch (e) {
                setError('Failed to send reset email. Please try again.');
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
    paddingHorizontal: uiScale(12, { category: 'spacing' }),
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
    transform: [{ translateY: -22 }],
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
    width: '90%',
  minWidth: 0,
  maxWidth: 520,
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
  padding: uiScale(12, { category: 'spacing' }),
  paddingLeft: uiScale(10, { category: 'spacing' }),
  fontSize: uiScale(16, { category: 'font' }),
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
