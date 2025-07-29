import { useAuth } from '@/contexts/AuthContext';
import { Colors, Typography } from '@/themes/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
        : await register(email, password);

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
    <View style={styles.container}>
      <Image
        source={require('@/assets/images/img2.png')}
        style={{ width: 200, height: 200, marginBottom: 30 }} />
      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <MaterialCommunityIcons name="email-outline" size={24} color={Colors.lightgray} style={styles.inputIcon} />
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
          <MaterialCommunityIcons name="lock-outline" size={24} color={Colors.lightgray} style={styles.inputIcon} />
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
              size={24}
              color={Colors.lightgray}
            />
          </TouchableOpacity>
        </View>
        {error ? (
          <Text style={styles.errorText}>Problem {error}</Text>
        ) : null}

        <TouchableOpacity
          style={[styles.button, isSubmitting && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.buttonText}>
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

        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>or login with</Text>
          <View style={styles.divider} />
        </View>

        <TouchableOpacity style={styles.socialButton} onPress={() => console.log('Google login')}>
          <MaterialCommunityIcons name="google" size={24} color="#fff" />
          <Text style={styles.socialButtonText}>Google</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  passwordContainer: {
    marginBottom: 15,
  },
  passwordInput: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
    paddingRight: 50,
  },
  eyeButton: {
    padding: 10,
    position: 'absolute',
    right: 5,
    top: '50%',
    transform: [{ translateY: -22 }],
  },
  errorText: {
    color: '#ff6b6b',
    fontFamily: Typography.fontFamily,
    fontSize: 12,
    marginBottom: 15,
    textAlign: 'center',
  },
  title: {
    fontFamily: Typography.fontFamily,
    color: "#fff",
    fontSize: 48,
    textAlign: 'center',
    marginBottom: 40,
  },
  welcomeText: {
    fontFamily: Typography.fontFamily,
    color: "#fff",
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
  form: {
    width: '90%',
    minWidth: 300,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    marginBottom: 15,
    position: 'relative',
  },
  inputIcon: {
    paddingLeft: 15,
  },
  input: {
    flex: 1,
    color: '#fff',
    padding: 15,
    paddingLeft: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#db2020ff",
    paddingHorizontal: 30,
    paddingVertical: 15,
    paddingBottom: 18,
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
    fontSize: 24,
    textAlign: 'center',
  },
  switchText: {
    fontFamily: Typography.fontFamily,
    color: '#fff',
    textAlign: 'center',
    marginTop: 15,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 30,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#fff',
    opacity: 0.3,
  },
  dividerText: {
    color: '#fff',
    paddingHorizontal: 10,
    opacity: 0.8,
    fontFamily: Typography.fontFamily,
  },
  socialButton: {
    backgroundColor: '#DB4437',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    gap: 10,
  },
  socialButtonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: Typography.fontFamily,
  },
  forgotPasswordText: {
    fontFamily: Typography.fontFamily,
    color: Colors.lightgray,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 5,
    fontSize: 14,
  },
});
