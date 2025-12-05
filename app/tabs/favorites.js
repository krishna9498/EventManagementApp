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
import { db, auth } from '../../config/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

export default function FavoritesScreen() {
  const router = useRouter();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    if (!auth.currentUser) return;

    try {
      // First get user's favorites list
      const userRef = doc(db, 'users', auth.currentUser.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const favoriteIds = userData.favorites || [];
        
        // Fetch each favorite event
        const favoriteEvents = [];
        for (const eventId of favoriteIds) {
          const eventRef = doc(db, 'events', eventId);
          const eventDoc = await getDoc(eventRef);
          if (eventDoc.exists()) {
            favoriteEvents.push({ id: eventDoc.id, ...eventDoc.data() });
          }
        }
        
        setFavorites(favoriteEvents);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Favorites',
      'Are you sure you want to clear all favorites?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear All', style: 'destructive', onPress: () => {
          // TODO: Clear favorites from Firestore
          setFavorites([]);
          Alert.alert('Success', 'All favorites cleared');
        }}
      ]
    );
  };

  const removeFromFavorites = (eventId) => {
    Alert.alert(
      'Remove Favorite',
      'Remove this event from favorites?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => {
          setFavorites(prev => prev.filter(event => event.id !== eventId));
          Alert.alert('Success', 'Event removed from favorites');
        }}
      ]
    );
  };

  const renderFavoriteItem = ({ item }) => (
    <TouchableOpacity
      style={styles.favoriteCard}
      onPress={() => router.push(`/event-detail?id=${item.id}`)}
    >
      <View style={styles.favoriteContent}>
        <Text style={styles.favoriteTitle}>{item.title}</Text>
        <Text style={styles.favoriteLocation}>{item.location}</Text>
        <Text style={styles.favoriteDate}>
          {item.date ? new Date(item.date.seconds * 1000).toLocaleDateString() : 'Date not set'}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeFromFavorites(item.id)}
      >
        <Text style={styles.removeButtonText}>Remove</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Favorites</Text>
        {favorites.length > 0 && (
          <TouchableOpacity onPress={handleClearAll}>
            <Text style={styles.clearText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.centered}>
          <Text>Loading favorites...</Text>
        </View>
      ) : favorites.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No favorites yet</Text>
          <Text style={styles.emptySubtext}>Tap the heart icon on events to add them here</Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          renderItem={renderFavoriteItem}
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  clearText: {
    color: '#f44336',
    fontWeight: 'bold',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  emptySubtext: {
    color: '#666',
    textAlign: 'center',
  },
  listContent: {
    padding: 10,
  },
  favoriteCard: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  favoriteContent: {
    flex: 1,
  },
  favoriteTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  favoriteLocation: {
    color: '#666',
    marginBottom: 2,
    fontSize: 14,
  },
  favoriteDate: {
    color: '#2196F3',
    fontSize: 12,
  },
  removeButton: {
    backgroundColor: '#ffebee',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  removeButtonText: {
    color: '#d32f2f',
    fontSize: 12,
    fontWeight: 'bold',
  },
});