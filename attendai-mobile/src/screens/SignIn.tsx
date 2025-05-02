import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';
import { BACKEND_URL } from '@env';

const SignIn: React.FC = () => {
  const { setUser } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = async () => {
    try {
      const tokenRes = await axios.post(`${BACKEND_URL}/api/users/token/`, {
        username,
        password,
      });

      const { access, refresh } = tokenRes.data;
      await AsyncStorage.setItem('access_token', access);
      await AsyncStorage.setItem('refresh_token', refresh);
      await AsyncStorage.setItem('username', username);

      const userRes = await axios.get(`${BACKEND_URL}/api/users/me/`, {
        headers: {
          Authorization: `Bearer ${access}`,
        },
      });

      const user = userRes.data;

      if (user.role !== 'teacher') {
        Alert.alert('Access Denied', 'Only teacher accounts are allowed to use this app.');
        return;
      }

      setUser(user);
    } catch (error: any) {
      console.error(error);
      Alert.alert('Login failed', error?.response?.data?.detail || 'Check credentials or network.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AttendAI Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        autoCapitalize="none"
        onChangeText={setUsername}
        value={username}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        onChangeText={setPassword}
        value={password}
      />

      <Button title="Sign In" onPress={handleSignIn} />
    </View>
  );
};

export default SignIn;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E2E',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    color: '#89B5FA',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    backgroundColor: '#292E44',
    color: '#CDD6F4',
    borderColor: '#555',
    borderWidth: 1,
    padding: 10,
    borderRadius: 6,
    marginBottom: 15,
  },
});
