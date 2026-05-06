import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Alert,
  TextInput,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { useAuth } from '../../context/AuthContext';
import { usersAPI } from '../../utils/api';
import { MaterialIcons, FontAwesome, AntDesign } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';

interface Doctor {
  _id: string;
  name: string;
  userType: string;
  specialization?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  rating?: number;
  reviews?: number;
  experience?: string;
  bio?: string;
  distance?: number;
}

export default function DoctorListScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('All');
  const [refreshing, setRefreshing] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'rating' | 'distance' | 'name'>('rating');
  const [showSortMenu, setShowSortMenu] = useState(false);

  const specialties = ['All', 'General', 'Cardiology', 'Dermatology', 'Orthopedics', 'Pediatrics'];

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    filterDoctors();
  }, [searchQuery, selectedSpecialty, doctors, sortBy]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required');
        setLoading(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const response = await usersAPI.getNearbyProfessionals(
        'doctor',
        loc.coords.latitude,
        loc.coords.longitude,
        25
      );

      const doctorsData = Array.isArray(response.data) ? response.data : [];
      setDoctors(doctorsData);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      Alert.alert('Error', 'Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  const filterDoctors = () => {
    let filtered = doctors;

    if (selectedSpecialty !== 'All') {
      filtered = filtered.filter(
        (doc) =>
          doc.specialization?.toLowerCase().includes(selectedSpecialty.toLowerCase()) ||
          doc.specialization === selectedSpecialty
      );
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (doc) =>
          doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.specialization?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'rating') {
        return (b.rating || 0) - (a.rating || 0);
      } else if (sortBy === 'distance') {
        return (a.distance || 999) - (b.distance || 999);
      } else if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });

    setFilteredDoctors(filtered);
  };

  const toggleFavorite = (doctorId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(doctorId)) {
      newFavorites.delete(doctorId);
    } else {
      newFavorites.add(doctorId);
    }
    setFavorites(newFavorites);
  };

  const handleDoctorSelect = (doctor: Doctor) => {
    router.push({
      pathname: '/doctors/[id]',
      params: { id: doctor._id, doctorData: JSON.stringify(doctor) },
    });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDoctors();
    setRefreshing(false);
  };

  const renderDoctorCard = ({ item }: { item: Doctor }) => (
    <TouchableOpacity
      style={styles.doctorCard}
      activeOpacity={0.8}
      onPress={() => handleDoctorSelect(item)}
    >
      {/* Avatar Section */}
      <View style={styles.avatarContainer}>
        {item.avatar ? (
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <FontAwesome name="user-md" size={40} color="#fff" />
          </View>
        )}
        <View style={styles.statusBadge}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Available</Text>
        </View>
      </View>

      {/* Doctor Info */}
      <View style={styles.doctorInfo}>
        <Text style={styles.doctorName}>{item.name}</Text>
        <Text style={styles.specialty}>
          {item.specialization || item.userType}
        </Text>

        {/* Rating Section */}
        <View style={styles.ratingContainer}>
          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <FontAwesome
                key={star}
                name={star <= (item.rating || 4) ? 'star' : 'star-o'}
                size={14}
                color="#FFB800"
              />
            ))}
          </View>
          <Text style={styles.reviews}>
            {item.reviews || 128} reviews
          </Text>
        </View>

        {/* Experience and Details */}
        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <MaterialIcons name="school" size={16} color="#0066CC" />
            <Text style={styles.detailText}>{item.experience || '5+ yrs'}</Text>
          </View>
          <View style={styles.detailItem}>
            <MaterialIcons name="phone" size={16} color="#0066CC" />
            <Text style={styles.detailText}>{item.phone || 'N/A'}</Text>
          </View>
        </View>

        {/* Bio */}
        {item.bio && (
          <Text style={styles.bio} numberOfLines={2}>
            {item.bio}
          </Text>
        )}
      </View>

      {/* Action Arrow */}
      <View style={styles.actionArrow}>
        <AntDesign name="right" size={20} color="#0066CC" />
      </View>

      {/* Favorite Button */}
      <TouchableOpacity
        style={styles.favoriteButton}
        onPress={() => toggleFavorite(item._id)}
      >
        <FontAwesome
          name={favorites.has(item._id) ? 'heart' : 'heart-o'}
          size={18}
          color={favorites.has(item._id) ? '#FF0000' : '#999'}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066CC" />
          <Text style={styles.loadingText}>Finding doctors nearby...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <AntDesign name="arrowleft" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Find Doctors</Text>
        <TouchableOpacity 
          style={styles.sortButton}
          onPress={() => setShowSortMenu(!showSortMenu)}
        >
          <MaterialIcons name="sort" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Sort Menu */}
      {showSortMenu && (
        <View style={styles.sortMenu}>
          <TouchableOpacity
            style={[styles.sortOption, sortBy === 'rating' && styles.sortOptionActive]}
            onPress={() => { setSortBy('rating'); setShowSortMenu(false); }}
          >
            <MaterialIcons name="star" size={18} color="#FFB800" />
            <Text style={[styles.sortOptionText, sortBy === 'rating' && styles.sortOptionTextActive]}>
              Top Rated
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortOption, sortBy === 'distance' && styles.sortOptionActive]}
            onPress={() => { setSortBy('distance'); setShowSortMenu(false); }}
          >
            <MaterialIcons name="my-location" size={18} color="#0066CC" />
            <Text style={[styles.sortOptionText, sortBy === 'distance' && styles.sortOptionTextActive]}>
              Nearest
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortOption, sortBy === 'name' && styles.sortOptionActive]}
            onPress={() => { setSortBy('name'); setShowSortMenu(false); }}
          >
            <MaterialIcons name="sort-by-alpha" size={18} color="#666" />
            <Text style={[styles.sortOptionText, sortBy === 'name' && styles.sortOptionTextActive]}>
              Name (A-Z)
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={20} color="#999" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or specialty"
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery !== '' && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <AntDesign name="close" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* Specialty Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.specialtyScroll}
        contentContainerStyle={styles.specialtyContent}
      >
        {specialties.map((specialty) => (
          <TouchableOpacity
            key={specialty}
            style={[
              styles.specialtyChip,
              selectedSpecialty === specialty && styles.specialtyChipActive,
            ]}
            onPress={() => setSelectedSpecialty(specialty)}
          >
            <Text
              style={[
                styles.specialtyText,
                selectedSpecialty === specialty && styles.specialtyTextActive,
              ]}
            >
              {specialty}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Doctors List */}
      {filteredDoctors.length > 0 ? (
        <FlatList
          data={filteredDoctors}
          keyExtractor={(item) => item._id}
          renderItem={renderDoctorCard}
          contentContainerStyle={styles.listContent}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          scrollEventThrottle={16}
        />
      ) : (
        <View style={styles.emptyState}>
          <MaterialIcons name="medical-services" size={64} color="#CCC" />
          <Text style={styles.emptyTitle}>No Doctors Found</Text>
          <Text style={styles.emptySubtitle}>
            Try adjusting your search or filters
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 14,
    color: '#333',
  },
  specialtyScroll: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  specialtyContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  specialtyChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  specialtyChipActive: {
    backgroundColor: '#0066CC',
    borderColor: '#0066CC',
  },
  specialtyText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  specialtyTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: 12,
  },
  doctorCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    padding: 12,
    alignItems: 'flex-start',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#0066CC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 6,
    paddingVertical: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00A86B',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#333',
  },
  doctorInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  specialty: {
    fontSize: 13,
    color: '#0066CC',
    fontWeight: '600',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  reviews: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  detailsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 6,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  bio: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
    lineHeight: 16,
  },
  actionArrow: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
    textAlign: 'center',
  },
  sortButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  sortMenu: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 4,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 10,
  },
  sortOptionActive: {
    backgroundColor: '#F0F7FF',
  },
  sortOptionText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  sortOptionTextActive: {
    color: '#0066CC',
    fontWeight: '700',
  },
  doctorCardWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
});
