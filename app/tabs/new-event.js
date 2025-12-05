import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { auth, db } from '../../config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function NewEventScreen() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    date: new Date(),
    time: '',
    category: '',
    price: '',
    capacity: '',
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData({ ...formData, date: selectedDate });
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      Alert.alert('Validation Error', 'Title is required');
      return false;
    }
    if (!formData.description.trim()) {
      Alert.alert('Validation Error', 'Description is required');
      return false;
    }
    if (!formData.location.trim()) {
      Alert.alert('Validation Error', 'Location is required');
      return false;
    }
    if (!formData.time.trim()) {
      Alert.alert('Validation Error', 'Time is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    if (!auth.currentUser) {
      Alert.alert('Error', 'You must be logged in to create an event');
      router.replace('/auth');
      return;
    }

    setLoading(true);

    try {
      await addDoc(collection(db, 'events'), {
        ...formData,
        date: formData.date,
        organizerId: auth.currentUser.uid,
        organizerEmail: auth.currentUser.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      Alert.alert('Success', 'Event created successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to create event: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Create New Event</Text>

          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="Event title"
            value={formData.title}
            onChangeText={(text) => handleInputChange('title', text)}
            maxLength={100}
          />

          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Event description"
            value={formData.description}
            onChangeText={(text) => handleInputChange('description', text)}
            multiline
            numberOfLines={4}
            maxLength={500}
          />

          <Text style={styles.label}>Location *</Text>
          <TextInput
            style={styles.input}
            placeholder="Event location"
            value={formData.location}
            onChangeText={(text) => handleInputChange('location', text)}
            maxLength={200}
          />

          <Text style={styles.label}>Date *</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateButtonText}>
              {formData.date.toLocaleDateString()}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={formData.date}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}

          <Text style={styles.label}>Time *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 2:00 PM - 4:00 PM"
            value={formData.time}
            onChangeText={(text) => handleInputChange('time', text)}
            maxLength={50}
          />

          <Text style={styles.label}>Category</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Music, Tech, Food"
            value={formData.category}
            onChangeText={(text) => handleInputChange('category', text)}
            maxLength={50}
          />

          <Text style={styles.label}>Price</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Free, $20, $50"
            value={formData.price}
            onChangeText={(text) => handleInputChange('price', text)}
            maxLength={20}
          />

          <Text style={styles.label}>Capacity</Text>
          <TextInput
            style={styles.input}
            placeholder="Number of attendees"
            value={formData.capacity}
            onChangeText={(text) => handleInputChange('capacity', text)}
            keyboardType="numeric"
            maxLength={10}
          />

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Creating...' : 'Create Event'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    padding: 20,
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 12,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#A5D6A7',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
});