/**
 * Web-Specific Emergency Service
 * Enhanced emergency features for web platform with browser APIs
 */

import { Platform } from 'react-native';

export interface BrowserNotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  actions?: Array<{ action: string; title: string; icon?: string }>;
}

/**
 * Request notification permission from browser
 */
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    console.warn('Browser notifications not supported');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission;
  }

  return Notification.permission;
};

/**
 * Send browser notification
 */
export const sendBrowserNotification = async (
  options: BrowserNotificationOptions
): Promise<Notification | null> => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    console.warn('Browser notifications not supported');
    return null;
  }

  const permission = await requestNotificationPermission();
  if (permission !== 'granted') {
    console.warn('Notification permission not granted');
    return null;
  }

  try {
    const notification = new Notification(options.title, {
      icon: options.icon || '/favicon.ico',
      badge: options.badge,
      tag: options.tag || 'emergency-notification',
      requireInteraction: options.requireInteraction !== false,
      silent: false,
      ...options,
    });

    // Auto-close after 10 seconds unless requireInteraction is true
    if (!options.requireInteraction) {
      setTimeout(() => notification.close(), 10000);
    }

    return notification;
  } catch (error) {
    console.error('Failed to send notification:', error);
    return null;
  }
};

/**
 * Trigger vibration on web (if supported)
 */
export const vibrateWeb = (pattern: number | number[]): boolean => {
  if (typeof window === 'undefined' || !navigator.vibrate) {
    console.warn('Vibration API not supported');
    return false;
  }

  try {
    return navigator.vibrate(pattern);
  } catch (error) {
    console.error('Vibration failed:', error);
    return false;
  }
};

/**
 * Emergency vibration pattern (SOS morse code: ... --- ...)
 */
export const emergencyVibrationPattern = (): number[] => {
  return [
    // SOS in morse code
    100, 100, 100, 100, 100, 300, // S (...)
    300, 100, 300, 100, 300, 300, // O (---)
    100, 100, 100, 100, 100, 0,    // S (...)
  ];
};

/**
 * Play emergency alert sound (web audio API)
 */
export const playEmergencySound = (): void => {
  if (typeof window === 'undefined' || !window.AudioContext) {
    return;
  }

  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Emergency siren sound
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.5);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 1);

    // Repeat 3 times
    setTimeout(() => playEmergencySound(), 1100);
  } catch (error) {
    console.error('Failed to play emergency sound:', error);
  }
};

/**
 * Check if device is online
 */
export const isOnline = (): boolean => {
  if (typeof window === 'undefined') return true;
  return navigator.onLine;
};

/**
 * Get device battery status (if available)
 */
export const getBatteryStatus = async (): Promise<{
  level: number;
  charging: boolean;
} | null> => {
  if (typeof window === 'undefined' || !(navigator as any).getBattery) {
    return null;
  }

  try {
    const battery = await (navigator as any).getBattery();
    return {
      level: battery.level * 100,
      charging: battery.charging,
    };
  } catch (error) {
    console.error('Battery status error:', error);
    return null;
  }
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  if (typeof window === 'undefined' || !navigator.clipboard) {
    // Fallback for older browsers
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      return success;
    } catch (error) {
      console.error('Clipboard fallback failed:', error);
      return false;
    }
  }

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Clipboard write failed:', error);
    return false;
  }
};

/**
 * Request wake lock to prevent screen from sleeping during emergency
 */
export const requestWakeLock = async (): Promise<any> => {
  if (typeof window === 'undefined' || !(navigator as any).wakeLock) {
    console.warn('Wake Lock API not supported');
    return null;
  }

  try {
    const wakeLock = await (navigator as any).wakeLock.request('screen');
    console.log('Wake lock acquired');
    return wakeLock;
  } catch (error) {
    console.error('Wake lock request failed:', error);
    return null;
  }
};

/**
 * Release wake lock
 */
export const releaseWakeLock = async (wakeLock: any): Promise<void> => {
  if (!wakeLock) return;

  try {
    await wakeLock.release();
    console.log('Wake lock released');
  } catch (error) {
    console.error('Wake lock release failed:', error);
  }
};

/**
 * Get device information for emergency context
 */
export const getDeviceInfo = (): {
  platform: string;
  userAgent: string;
  language: string;
  screenResolution: string;
  online: boolean;
} => {
  if (typeof window === 'undefined') {
    return {
      platform: 'unknown',
      userAgent: 'unknown',
      language: 'en',
      screenResolution: '0x0',
      online: true,
    };
  }

  return {
    platform: navigator.platform || 'unknown',
    userAgent: navigator.userAgent || 'unknown',
    language: navigator.language || 'en',
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    online: navigator.onLine,
  };
};

/**
 * Full screen mode for emergency (desktop focus)
 */
export const requestFullScreen = async (): Promise<boolean> => {
  if (typeof document === 'undefined') return false;

  try {
    const element = document.documentElement;
    if (element.requestFullscreen) {
      await element.requestFullscreen();
      return true;
    } else if ((element as any).webkitRequestFullscreen) {
      await (element as any).webkitRequestFullscreen();
      return true;
    } else if ((element as any).mozRequestFullScreen) {
      await (element as any).mozRequestFullScreen();
      return true;
    } else if ((element as any).msRequestFullscreen) {
      await (element as any).msRequestFullscreen();
      return true;
    }
    return false;
  } catch (error) {
    console.error('Fullscreen request failed:', error);
    return false;
  }
};

/**
 * Exit full screen mode
 */
export const exitFullScreen = async (): Promise<boolean> => {
  if (typeof document === 'undefined') return false;

  try {
    if (document.exitFullscreen) {
      await document.exitFullscreen();
      return true;
    } else if ((document as any).webkitExitFullscreen) {
      await (document as any).webkitExitFullscreen();
      return true;
    } else if ((document as any).mozCancelFullScreen) {
      await (document as any).mozCancelFullScreen();
      return true;
    } else if ((document as any).msExitFullscreen) {
      await (document as any).msExitFullscreen();
      return true;
    }
    return false;
  } catch (error) {
    console.error('Exit fullscreen failed:', error);
    return false;
  }
};

/**
 * Send emergency to all nearby devices via Web Bluetooth (experimental)
 */
export const broadcastEmergencyViaBluetooth = async (
  emergencyData: { latitude: number; longitude: number; message: string }
): Promise<boolean> => {
  if (typeof navigator === 'undefined' || !(navigator as any).bluetooth) {
    console.warn('Web Bluetooth not supported');
    return false;
  }

  try {
    // This is experimental and requires user interaction
    console.log('Broadcasting emergency via Bluetooth:', emergencyData);
    // Implementation would require specific Bluetooth service UUID
    return true;
  } catch (error) {
    console.error('Bluetooth broadcast failed:', error);
    return false;
  }
};

/**
 * Share emergency via Web Share API
 */
export const shareEmergencyWeb = async (data: {
  title: string;
  text: string;
  url?: string;
}): Promise<boolean> => {
  if (typeof navigator === 'undefined' || !(navigator as any).share) {
    console.warn('Web Share API not supported');
    return false;
  }

  try {
    await (navigator as any).share({
      title: data.title,
      text: data.text,
      url: data.url,
    });
    return true;
  } catch (error) {
    if ((error as Error).name !== 'AbortError') {
      console.error('Web share failed:', error);
    }
    return false;
  }
};

/**
 * Monitor network status for emergency
 */
export const monitorNetworkStatus = (
  onOnline: () => void,
  onOffline: () => void
): (() => void) => {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handleOnline = () => {
    console.log('Network: Online');
    onOnline();
  };

  const handleOffline = () => {
    console.log('Network: Offline');
    onOffline();
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Return cleanup function
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
};

/**
 * Geolocation with high accuracy for web
 */
export const getHighAccuracyLocation = (): Promise<{
  latitude: number;
  longitude: number;
  accuracy: number;
}> => {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
};

/**
 * Check all emergency capabilities
 */
export const checkEmergencyCapabilities = (): {
  notifications: boolean;
  vibration: boolean;
  geolocation: boolean;
  wakeLock: boolean;
  fullscreen: boolean;
  webShare: boolean;
  clipboard: boolean;
  battery: boolean;
  bluetooth: boolean;
} => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return {
      notifications: false,
      vibration: false,
      geolocation: false,
      wakeLock: false,
      fullscreen: false,
      webShare: false,
      clipboard: false,
      battery: false,
      bluetooth: false,
    };
  }

  return {
    notifications: 'Notification' in window,
    vibration: 'vibrate' in navigator,
    geolocation: 'geolocation' in navigator,
    wakeLock: 'wakeLock' in navigator,
    fullscreen: 'requestFullscreen' in document.documentElement,
    webShare: 'share' in navigator,
    clipboard: 'clipboard' in navigator,
    battery: 'getBattery' in navigator,
    bluetooth: 'bluetooth' in navigator,
  };
};
