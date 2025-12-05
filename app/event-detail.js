import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { auth, db } from '../config/firebase';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { toggleFavorite } from '../utils/firebaseHelpers';

export default function EventDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    if (id) {
      loadEvent();
    }
  }, [id]);

  const loadEvent = async () => {
    try {
      const eventRef = doc(db, 'events', id);
      const eventDoc = await getDoc(eventRef);
      
      if (eventDoc.exists()) {
        const eventData = { id: eventDoc.id, ...eventDoc.data() };
        setEvent(eventData);
        
        // Check if current user is the owner
        if (auth.currentUser && eventData.organizerId === auth.currentUser.uid) {
          setIsOwner(true);
        }
        
        // Check if event is in user's favorites
        if (auth.currentUser) {
          const userRef = doc(db, 'users', auth.currentUser.uid);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setIsFavorite(userData.favorites?.includes(id) || false);
          }
        }
      } else {
        Alert.alert('Error', 'Event not found');
        router.back();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!auth.currentUser) {
      Alert.alert('Error', 'You must be logged in to favorite events');
      return;
    }

    try {
      const newFavoriteStatus = await toggleFavorite(
        auth.currentUser.uid,
        id,
        isFavorite
      );
      setIsFavorite(newFavoriteStatus);
      Alert.alert(
        'Success',
        newFavoriteStatus ? 'Added to favorites' : 'Removed from favorites'
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update favorites');
    }
  };

  const handleEditEvent = () => {
    router.push(`/edit-event?id=${id}`);
  };

  const handleDeleteEvent = () => {
    Alert.alert(
      'Delete Event',
      'Are you sure you want to delete this event? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'events', id));
              Alert.alert('Success', 'Event deleted successfully', [
                { text: 'OK', onPress: () => router.back() }
              ]);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete event');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2196F3" />
        </View>
      </SafeAreaView>
    );
  }

  if (!event) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text>Event not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.eventContainer}>
          <Text style={styles.eventTitle}>{event.title}</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Location:</Text>
            <Text style={styles.detailValue}>{event.location}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date:</Text>
            <Text style={styles.detailValue}>
              {event.date ? new Date(event.date.seconds * 1000).toLocaleDateString() : 'Not set'}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Time:</Text>
            <Text style={styles.detailValue}>{event.time || 'Not set'}</Text>
          </View>
          
          {event.category && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Category:</Text>
              <Text style={styles.detailValue}>{event.category}</Text>
            </View>
          )}
          
          {event.price && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Price:</Text>
              <Text style={styles.detailValue}>{event.price}</Text>
            </View>
          )}
          
          {event.capacity && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Capacity:</Text>
              <Text style={styles.detailValue}>{event.capacity} people</Text>
            </View>
          )}
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{event.description}</Text>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Organizer</Text>
            <Text style={styles.organizer}>{event.organizerEmail}</Text>
          </View>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, isFavorite ? styles.favoriteActive : styles.favorite]}
              onPress={handleToggleFavorite}
            >
              <Text style={styles.actionButtonText}>
                {isFavorite ? '❤️ Remove Favorite' : '🤍 Add to Favorites'}
              </Text>
            </TouchableOpacity>
            
            {isOwner && (
              <>
                <TouchableOpacity
                  style={[styles.actionButton, styles.editButton]}
                  onPress={handleEditEvent}
                >
                  <Text style={styles.actionButtonText}>✏️ Edit Event</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={handleDeleteEvent}
                >
                  <Text style={styles.actionButtonText}>🗑️ Delete Event</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  detailLabel: {
    fontWeight: 'bold',
    width: 100,
    fontSize: 16,
    color: '#555',
  },
  detailValue: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  section: {
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
  },
  organizer: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
  actionButtons: {
    marginTop: 30,
    gap: 10,
  },
  actionButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  favorite: {
    backgroundColor: '#ffebee',
    borderWidth: 1,
    borderColor: '#ffcdd2',
  },
  favoriteActive: {
    backgroundColor: '#fce4ec',
    borderWidth: 1,
    borderColor: '#f8bbd9',
  },
  editButton: {
    backgroundColor: '#e3f2fd',
    borderWidth: 1,
    borderColor: '#bbdefb',
  },
  deleteButton: {
    backgroundColor: '#ffebee',
    borderWidth: 1,
    borderColor: '#ffcdd2',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
});