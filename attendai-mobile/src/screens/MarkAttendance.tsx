import React, { useState } from 'react';
import {
  View,
  Text,
  Button,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { BACKEND_URL } from '@env';

const MarkAttendance: React.FC = () => {
  const navigation = useNavigation();
  const [images, setImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [status, setStatus] = useState<'onTime' | 'late'>('onTime');
  const [loading, setLoading] = useState(false);

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImages(result.assets);
    }
  };

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({ quality: 1 });
    if (!result.canceled) {
      setImages((prev) => [...prev, ...result.assets]);
    }
  };

  const uploadAttendance = async () => {
    if (images.length === 0) {
      Alert.alert('Error', 'Please select at least one image.');
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('access_token');
      const formData = new FormData();

      images.forEach((img, index) => {
        const uriParts = img.uri.split('.');
        const fileType = uriParts[uriParts.length - 1];
        formData.append('images', {
          uri: img.uri,
          name: `photo${index}.${fileType}`,
          type: `image/${fileType}`,
        } as any);
      });

      formData.append('status', status);

      await axios.post(`${BACKEND_URL}/api/facial_recognition/mark/`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      Alert.alert('Success', 'Attendance marked successfully!');
      setImages([]);
    } catch (error) {
      console.error('Upload failed:', error);
      Alert.alert('Error', 'Failed to mark attendance.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'username']);
    navigation.reset({ index: 0, routes: [{ name: 'SignIn' }] });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Mark Attendance</Text>

      <View style={styles.buttonRow}>
        <Button title="Take Photo" onPress={takePhoto} />
        <Button title="Pick from Gallery" onPress={pickImages} />
      </View>

      {images.length > 0 && (
        <View style={styles.previewContainer}>
          <Text style={styles.previewLabel}>Preview:</Text>
          <ScrollView horizontal>
            {images.map((img, index) => (
              <Image key={index} source={{ uri: img.uri }} style={styles.imagePreview} />
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.buttonRow}>
        <Button title="On Time" onPress={() => setStatus('onTime')} />
        <Button title="Late" onPress={() => setStatus('late')} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#89B5FA" />
      ) : (
        <Button title="Submit Attendance" onPress={uploadAttendance} />
      )}

      <View style={{ marginTop: 20 }}>
        <Button title="Log Out" color="#EF4444" onPress={handleLogout} />
      </View>
    </ScrollView>
  );
};

export default MarkAttendance;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#1E1E2E',
    flexGrow: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    color: '#89B5FA',
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  previewContainer: {
    marginVertical: 20,
  },
  previewLabel: {
    color: '#CDD6F4',
    marginBottom: 10,
  },
  imagePreview: {
    width: 100,
    height: 100,
    marginRight: 10,
    borderRadius: 8,
  },
});
