import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
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

      for (let index = 0; index < images.length; index++) {
        const img = images[index];

        const manipulated = await ImageManipulator.manipulateAsync(
          img.uri,
          [{ resize: { width: 800 } }],
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
        );

        formData.append('images', {
          uri: manipulated.uri,
          name: `photo${index}.jpg`,
          type: 'image/jpeg',
        } as any);
      }

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
      <View style={styles.header}>
        <Text style={styles.headerText}>📸 Mark Attendance</Text>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.button} onPress={takePhoto}>
          <Text style={styles.buttonText}>Take Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={pickImages}>
          <Text style={styles.buttonText}>Pick from Gallery</Text>
        </TouchableOpacity>
      </View>

      {images.length > 0 && (
        <View style={styles.previewContainer}>
          <Text style={styles.previewLabel}>Preview:</Text>
          <ScrollView horizontal>
            {images.map((img, index) => (
              <View key={index} style={styles.imageCard}>
                <Image source={{ uri: img.uri }} style={styles.imagePreview} />
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.statusRow}>
        {['onTime', 'late'].map((s) => (
          <TouchableOpacity
            key={s}
            style={[
              styles.statusButton,
              status === s && styles.statusButtonSelected,
            ]}
            onPress={() => setStatus(s as 'onTime' | 'late')}
          >
            <Text
              style={[
                styles.statusButtonText,
                status === s && styles.statusButtonTextSelected,
              ]}
            >
              {s === 'onTime' ? 'On Time' : 'Late'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#89B5FA" />
      ) : (
        <TouchableOpacity style={[styles.button, styles.submitButton]} onPress={uploadAttendance}>
          <Text style={styles.buttonText}>Submit Attendance</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Log Out</Text>
      </TouchableOpacity>
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
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#89B5FA',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  button: {
    backgroundColor: '#89B5FA',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
    minWidth: 140,
  },
  submitButton: {
    marginTop: 20,
    alignSelf: 'center',
    width: '80%',
  },
  buttonText: {
    color: '#1E1E2E',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  previewContainer: {
    marginVertical: 20,
  },
  previewLabel: {
    color: '#CDD6F4',
    marginBottom: 10,
    fontSize: 16,
  },
  imageCard: {
    marginRight: 10,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#2E2E3E',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
  },
  imagePreview: {
    width: 100,
    height: 100,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
  },
  statusButton: {
    borderWidth: 1,
    borderColor: '#89B5FA',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 5,
  },
  statusButtonSelected: {
    backgroundColor: '#89B5FA',
  },
  statusButtonText: {
    color: '#89B5FA',
  },
  statusButtonTextSelected: {
    color: '#1E1E2E',
    fontWeight: 'bold',
  },
  logoutButton: {
    marginTop: 30,
    backgroundColor: '#EF4444',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    alignSelf: 'center',
    width: '80%',
  },
  logoutButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});
