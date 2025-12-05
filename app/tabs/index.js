import { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { auth, db } from '../../config/firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function EventListScreen() {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'events'));
      const eventsData = [];
      querySnapshot.forEach((doc) => {
        eventsData.push({ id: doc.id, ...doc.data() });
      });
      setEvents(eventsData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      router.replace('/auth');
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  const renderEventItem = ({ item }) => (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={() => router.push(`/event-detail?id=${item.id}`)}
    >
      <Text style={styles.eventTitle}>{item.title}</Text>
      <Text style={styles.eventLocation}>{item.location}</Text>
      <Text style={styles.eventDate}>
        {item.date ? new Date(item.date.seconds * 1000).toLocaleDateString() : 'Date not set'}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Upcoming Events</Text>
        <TouchableOpacity onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <Text>Loading events...</Text>
        </View>
      ) : events.length === 0 ? (
        <View style={styles.centered}>
          <Text>No events found</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => router.push('/tabs/new-event')}
          >
            <Text style={styles.createButtonText}>Create Your First Event</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          renderItem={renderEventItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  signOutText: {
    color: '#f44336',
    fontWeight: 'bold',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 10,
  },
  eventCard: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  eventLocation: {
    color: '#666',
    marginBottom: 3,
  },
  eventDate: {
    color: '#2196F3',
    fontWeight: '500',
  },
  createButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  createButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});