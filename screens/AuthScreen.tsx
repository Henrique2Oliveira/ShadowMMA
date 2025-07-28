import { useAuth } from '@/contexts/AuthContext';
import { Colors, Typography } from '@/themes/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, register } = useAuth();

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
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#666"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#666"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
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

        <TouchableOpacity
          onPress={() => {
            setIsLogin(!isLogin);
            setError('');
          }}
          disabled={isSubmitting}
        >
          <Text style={styles.switchText}>
            {isLogin ? 'New fighter? Create an account' : 'Have an account? Login'}
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
  errorText: {
    color: '#ff6b6b',
    fontFamily: Typography.fontFamily,
    fontSize: 14,
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
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: Colors.button,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    elevation: 3,
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
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
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
});
