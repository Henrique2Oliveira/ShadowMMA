import { useAuth } from '@/contexts/AuthContext';
import { Colors, Typography } from '@/themes/theme';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, register } = useAuth();

  const handleSubmit = async () => {
    if (isLogin) {
      await login(email, password);
    } else {
      await register(email, password);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SHADOW MMA</Text>
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
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>{isLogin ? 'Login' : 'Register'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
          <Text style={styles.switchText}>
            {isLogin ? 'Need an account? Register' : 'Have an account? Login'}
          </Text>
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
    backgroundColor: Colors.background,
  },
  title: {
    fontFamily: Typography.fontFamily,
    color: "#fff",
    fontSize: 48,
    textAlign: 'center',
    marginBottom: 40,
  },
  form: {
    width: '80%',
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
});
