import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

interface StorageData {
  [key: string]: any;
}

export const storageService = {
  setAuthToken: async (token: string) => {
    try {
      await SecureStore.setItemAsync('authToken', token);
    } catch (error) {
      console.error('Error storing token:', error);
    }
  },

  getAuthToken: async () => {
    try {
      return await SecureStore.getItemAsync('authToken');
    } catch (error) {
      console.error('Error retrieving token:', error);
      return null;
    }
  },

  removeAuthToken: async () => {
    try {
      await SecureStore.deleteItemAsync('authToken');
    } catch (error) {
      console.error('Error removing token:', error);
    }
  },

  setUserData: async (userData: any) => {
    try {
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
    } catch (error) {
      console.error('Error storing user data:', error);
    }
  },

  getUserData: async () => {
    try {
      const data = await AsyncStorage.getItem('userData');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error retrieving user data:', error);
      return null;
    }
  },

  clearAuthData: async () => {
    try {
      await AsyncStorage.multiRemove(['userData', 'authToken']);
      await SecureStore.deleteItemAsync('authToken');
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  },

  // Appointments local cache (native)
  appendAppointment: async (appointment: any) => {
    try {
      const raw = await AsyncStorage.getItem('appointments');
      const list = raw ? JSON.parse(raw) : [];
      list.unshift(appointment);
      await AsyncStorage.setItem('appointments', JSON.stringify(list.slice(0, 50)));
    } catch (error) {
      console.error('Error caching appointment:', error);
    }
  },

  getAppointments: async (): Promise<any[]> => {
    try {
      const raw = await AsyncStorage.getItem('appointments');
      return raw ? JSON.parse(raw) : [];
    } catch (error) {
      console.error('Error reading appointments:', error);
      return [];
    }
  },

  // Bookings local cache (native)
  appendBooking: async (booking: any) => {
    try {
      const raw = await AsyncStorage.getItem('bookings');
      const list = raw ? JSON.parse(raw) : [];
      list.unshift(booking);
      await AsyncStorage.setItem('bookings', JSON.stringify(list.slice(0, 50)));
    } catch (error) {
      console.error('Error caching booking:', error);
    }
  },

  getBookings: async (): Promise<any[]> => {
    try {
      const raw = await AsyncStorage.getItem('bookings');
      return raw ? JSON.parse(raw) : [];
    } catch (error) {
      console.error('Error reading bookings:', error);
      return [];
    }
  },
};
