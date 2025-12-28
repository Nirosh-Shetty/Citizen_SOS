// Web-specific storage service implementation using localStorage

interface StorageData {
  [key: string]: any;
}

const TOKEN_KEY = 'authToken';
const USER_DATA_KEY = 'userData';

const safeGet = (key: string): string | null => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    return window.localStorage.getItem(key);
  } catch (err) {
    console.error('[WEB] storage get error:', err);
    return null;
  }
};

const safeSet = (key: string, value: string): void => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.setItem(key, value);
  } catch (err) {
    console.error('[WEB] storage set error:', err);
  }
};

const safeRemove = (key: string): void => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.removeItem(key);
  } catch (err) {
    console.error('[WEB] storage remove error:', err);
  }
};

export const storageService = {
  setAuthToken: async (token: string) => {
    safeSet(TOKEN_KEY, token);
  },

  getAuthToken: async (): Promise<string | null> => {
    return safeGet(TOKEN_KEY);
  },

  removeAuthToken: async () => {
    safeRemove(TOKEN_KEY);
  },

  setUserData: async (userData: StorageData) => {
    safeSet(USER_DATA_KEY, JSON.stringify(userData));
  },

  getUserData: async (): Promise<StorageData | null> => {
    const raw = safeGet(USER_DATA_KEY);
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  clearAuthData: async () => {
    safeRemove(USER_DATA_KEY);
    safeRemove(TOKEN_KEY);
  },
  // Appointments local cache (web)
  appendAppointment: async (appointment: any) => {
    const raw = safeGet('appointments');
    let list: any[] = [];
    try {
      list = raw ? JSON.parse(raw) : [];
    } catch {}
    list.unshift(appointment);
    safeSet('appointments', JSON.stringify(list.slice(0, 50)));
  },

  getAppointments: async (): Promise<any[]> => {
    const raw = safeGet('appointments');
    try {
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  // Bookings local cache (web)
  appendBooking: async (booking: any) => {
    const raw = safeGet('bookings');
    let list: any[] = [];
    try {
      list = raw ? JSON.parse(raw) : [];
    } catch {}
    list.unshift(booking);
    safeSet('bookings', JSON.stringify(list.slice(0, 50)));
  },

  getBookings: async (): Promise<any[]> => {
    const raw = safeGet('bookings');
    try {
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },
};
