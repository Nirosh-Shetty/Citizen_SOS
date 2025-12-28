import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, FlatList, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { bookingAPI } from '../../utils/api';
import { storageService } from '../../utils/storage';

interface Booking {
  _id: string;
  serviceType: string;
  scheduledTime?: string;
  status: string;
  amount?: number;
}

export default function BookingsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, [user?.id]);

  const fetchBookings = async () => {
    try {
      let merged: Booking[] = [];
      const local = await storageService.getBookings();
      if (Array.isArray(local)) merged = local as Booking[];
      if (user?.id) {
        const res = await bookingAPI.getUserBookings(user.id);
        const remote = Array.isArray(res.data) ? res.data : [];
        const map = new Map<string, Booking>();
        [...merged, ...remote].forEach((item: any) => {
          const id = item._id || `${item.serviceType}-${item.scheduledTime || ''}`;
          if (!map.has(id)) map.set(id, item);
        });
        merged = Array.from(map.values());
      }
      setBookings(merged);
    } catch (e) {
      console.error('Error fetching bookings:', e);
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (id: string) => {
    try {
      await bookingAPI.cancelBooking(id);
      await fetchBookings();
      Alert.alert('Cancelled', 'Booking has been cancelled');
    } catch (e) {
      Alert.alert('Error', 'Failed to cancel booking');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>My Bookings</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#FF0000" />
        ) : bookings.length > 0 ? (
          <FlatList
            data={bookings}
            keyExtractor={(item) => item._id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={styles.bookingCard}>
                <View style={styles.bookingHeader}>
                  <Text style={styles.bookingTitle}>{item.serviceType?.replace('-', ' ')}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      item.status === 'pending' && { backgroundColor: '#FFA500' },
                      item.status === 'confirmed' && { backgroundColor: '#4CAF50' },
                      item.status === 'completed' && { backgroundColor: '#2196F3' },
                      item.status === 'cancelled' && { backgroundColor: '#F44336' },
                    ]}
                  >
                    <Text style={styles.statusText}>{item.status}</Text>
                  </View>
                </View>
                <View style={styles.bookingDetails}>
                  <Text style={styles.detailLabel}>📅 Scheduled</Text>
                  <Text style={styles.detailValue}>
                    {item.scheduledTime ? new Date(item.scheduledTime).toLocaleString() : 'N/A'}
                  </Text>
                  {typeof item.amount === 'number' && (
                    <>
                      <Text style={styles.detailLabel}>💰 Amount</Text>
                      <Text style={styles.detailValue}>₹{item.amount}</Text>
                    </>
                  )}
                </View>
                {item.status === 'pending' && (
                  <View style={styles.actions}>
                    <TouchableOpacity style={styles.actionButton} onPress={() => cancelBooking(item._id)}>
                      <Text style={styles.actionButtonText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🚑</Text>
            <Text style={styles.emptyTitle}>No Bookings</Text>
            <Text style={styles.emptySubtitle}>You don't have any service bookings</Text>
            <TouchableOpacity style={styles.newButton} onPress={() => router.push('/ambulance/book')}>
              <Text style={styles.newButtonText}>Book an Ambulance</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { flexGrow: 1, padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  backButton: { fontSize: 16, color: '#FF0000', fontWeight: '600', marginRight: 12 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#333', flex: 1 },
  bookingCard: { backgroundColor: '#f9f9f9', padding: 16, borderRadius: 8, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: '#FF0000' },
  bookingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  bookingTitle: { fontSize: 16, fontWeight: '600', color: '#333' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { color: '#fff', fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  bookingDetails: { marginBottom: 12 },
  detailLabel: { fontSize: 12, color: '#666', fontWeight: '600', marginTop: 8 },
  detailValue: { fontSize: 14, color: '#333', marginTop: 2 },
  actions: { flexDirection: 'row', gap: 8 },
  actionButton: { flex: 1, backgroundColor: '#F44336', paddingVertical: 8, borderRadius: 6, alignItems: 'center' },
  actionButtonText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#666', marginBottom: 24 },
  newButton: { backgroundColor: '#FF0000', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  newButtonText: { color: '#fff', fontWeight: '600' },
});
