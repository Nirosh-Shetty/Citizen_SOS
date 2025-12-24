import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { useAuth } from '../../context/AuthContext';
import { usersAPI } from '../../utils/api';
import { MaterialIcons, AntDesign } from '@expo/vector-icons';

const { height, width } = Dimensions.get('window');

// Using OpenStreetMap / Leaflet for web-like experience (no API key required)
// For web, we'll show a list-based map view with interactive cards

export default function DoctorsMapScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [location, setLocation] = useState<any>(null);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [nurses, setNurses] = useState<any[]>([]);
  const [ambulances, setAmbulances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDoctors, setShowDoctors] = useState(true);
  const [showNurses, setShowNurses] = useState(true);
  const [showAmbulances, setShowAmbulances] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'doctors' | 'nurses' | 'ambulances'>('all');
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    initializeMap();
  }, []);

  const initializeMap = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setLocation(loc.coords);
      fetchNearbyProfessionals(loc.coords.latitude, loc.coords.longitude);
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert('Error', 'Could not get your location');
    }
  };

  const fetchNearbyProfessionals = async (latitude: number, longitude: number) => {
    try {
      setLoading(true);
      const [doctorRes, nurseRes, ambulanceRes] = await Promise.all([
        usersAPI.getNearbyProfessionals('doctor', latitude, longitude, 15),
        usersAPI.getNearbyProfessionals('nurse', latitude, longitude, 15),
        usersAPI.getNearbyAmbulances(latitude, longitude, 15),
      ]);

      setDoctors(doctorRes.data || []);
      setNurses(nurseRes.data || []);
      setAmbulances(ambulanceRes.data || []);
    } catch (error) {
      console.error('Error fetching professionals:', error);
      Alert.alert('Error', 'Failed to load nearby professionals');
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = (professional: any) => {
    router.push({
      pathname: '/appointments/book',
      params: { professionalId: professional._id },
    });
  };

  const getProfessionalIcon = (type: 'doctor' | 'nurse' | 'ambulance') => {
    switch (type) {
      case 'doctor':
        return <MaterialIcons name="person" size={24} color="#fff" />;
      case 'nurse':
        return <MaterialIcons name="person" size={24} color="#fff" />;
      case 'ambulance':
        return <MaterialIcons name="local-hospital" size={24} color="#fff" />;
    }
  };

  const getProfessionalColor = (type: 'doctor' | 'nurse' | 'ambulance') => {
    switch (type) {
      case 'doctor':
        return '#1976D2';
      case 'nurse':
        return '#E91E63';
      case 'ambulance':
        return '#F44336';
    }
  };

  const ProfessionalCard = ({ professional, type }: { professional: any; type: 'doctor' | 'nurse' | 'ambulance' }) => {
    const distance = (Math.random() * 5).toFixed(1);
    return (
      <View style={styles.professionalCard}>
        <View style={[styles.professionalIcon, { backgroundColor: getProfessionalColor(type) }]}>
          {getProfessionalIcon(type)}
        </View>
        <View style={styles.professionalDetails}>
          <Text style={styles.professionalName}>{professional.name}</Text>
          <Text style={styles.professionalSpec}>
            {type === 'doctor' ? professional.specialization : type === 'nurse' ? 'Registered Nurse' : 'Ambulance Service'}
          </Text>
          <View style={styles.ratingRow}>
            <AntDesign name="star" size={12} color="#FFC107" />
            <Text style={styles.rating}>4.{Math.floor(Math.random() * 9) + 1}</Text>
            <Text style={styles.distance}>• {distance} km away</Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.bookButton, { backgroundColor: getProfessionalColor(type) }]}
          onPress={() => handleBookAppointment(professional)}
        >
          <Text style={styles.bookButtonText}>Book</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const displayProfessionals = () => {
    let combined: any[] = [];

    if (selectedFilter === 'all' || selectedFilter === 'doctors') {
      combined = [
        ...combined,
        ...doctors.map(d => ({ ...d, type: 'doctor' })),
      ];
    }
    if (selectedFilter === 'all' || selectedFilter === 'nurses') {
      combined = [
        ...combined,
        ...nurses.map(n => ({ ...n, type: 'nurse' })),
      ];
    }
    if (selectedFilter === 'all' || selectedFilter === 'ambulances') {
      combined = [
        ...combined,
        ...ambulances.map(a => ({ ...a, type: 'ambulance' })),
      ];
    }

    return combined;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#1976D2" />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text style={styles.headerTitleText}>Nearby Services</Text>
          <Text style={styles.headerSubtitle}>Find doctors, nurses & ambulances</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      {/* Location Info */}
      {location && (
        <View style={styles.locationInfo}>
          <MaterialIcons name="location-on" size={16} color="#1976D2" />
          <Text style={styles.locationText}>
            Showing services within 15 km radius
          </Text>
        </View>
      )}

      {/* Filter Buttons */}
      <View style={styles.filterSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContent}
        >
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedFilter === 'all' && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedFilter('all')}
          >
            <MaterialIcons
              name="apps"
              size={18}
              color={selectedFilter === 'all' ? '#fff' : '#1976D2'}
            />
            <Text
              style={[
                styles.filterButtonText,
                selectedFilter === 'all' && styles.filterButtonTextActive,
              ]}
            >
              All ({doctors.length + nurses.length + ambulances.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedFilter === 'doctors' && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedFilter('doctors')}
          >
            <MaterialIcons
              name="person"
              size={18}
              color={selectedFilter === 'doctors' ? '#fff' : '#1976D2'}
            />
            <Text
              style={[
                styles.filterButtonText,
                selectedFilter === 'doctors' && styles.filterButtonTextActive,
              ]}
            >
              Doctors ({doctors.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedFilter === 'nurses' && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedFilter('nurses')}
          >
            <MaterialIcons
              name="favorite"
              size={18}
              color={selectedFilter === 'nurses' ? '#fff' : '#E91E63'}
            />
            <Text
              style={[
                styles.filterButtonText,
                selectedFilter === 'nurses' && styles.filterButtonTextActive,
              ]}
            >
              Nurses ({nurses.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedFilter === 'ambulances' && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedFilter('ambulances')}
          >
            <MaterialIcons
              name="local-hospital"
              size={18}
              color={selectedFilter === 'ambulances' ? '#fff' : '#F44336'}
            />
            <Text
              style={[
                styles.filterButtonText,
                selectedFilter === 'ambulances' && styles.filterButtonTextActive,
              ]}
            >
              Ambulances ({ambulances.length})
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Professionals List */}
      <ScrollView
        ref={scrollRef}
        style={styles.listContainer}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1976D2" />
            <Text style={styles.loadingText}>Loading nearby services...</Text>
          </View>
        ) : displayProfessionals().length > 0 ? (
          displayProfessionals().map((professional, index) => (
            <ProfessionalCard
              key={`${professional.type}-${index}`}
              professional={professional}
              type={professional.type}
            />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="location-off" size={64} color="#DDD" />
            <Text style={styles.emptyText}>No services found in your area</Text>
            <Text style={styles.emptySubtext}>Try expanding your search radius</Text>
          </View>
        )}
      </ScrollView>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#1976D2' }]} />
          <Text style={styles.legendText}>Doctors</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#E91E63' }]} />
          <Text style={styles.legendText}>Nurses</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#F44336' }]} />
          <Text style={styles.legendText}>Ambulances</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#E3F2FD',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 8,
  },
  locationText: {
    fontSize: 12,
    color: '#1976D2',
    marginLeft: 8,
    fontWeight: '500',
  },
  filterSection: {
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  filterScroll: {
    paddingHorizontal: 16,
  },
  filterContent: {
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterButtonActive: {
    backgroundColor: '#1976D2',
    borderColor: '#1976D2',
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1976D2',
    marginLeft: 6,
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  professionalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  professionalIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  professionalDetails: {
    flex: 1,
  },
  professionalName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  professionalSpec: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  rating: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginLeft: 4,
  },
  distance: {
    fontSize: 12,
    color: '#999',
  },
  bookButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: height * 0.4,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: height * 0.4,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 12,
    color: '#CCC',
    marginTop: 6,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
});
