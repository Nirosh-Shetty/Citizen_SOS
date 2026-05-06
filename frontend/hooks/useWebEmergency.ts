/**
 * Web Emergency Hook
 * Custom hook for managing web-specific emergency features
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Platform } from 'react-native';
import {
  requestNotificationPermission,
  sendBrowserNotification,
  vibrateWeb,
  emergencyVibrationPattern,
  playEmergencySound,
  isOnline,
  getBatteryStatus,
  requestWakeLock,
  releaseWakeLock,
  getDeviceInfo,
  requestFullScreen,
  exitFullScreen,
  shareEmergencyWeb,
  monitorNetworkStatus,
  checkEmergencyCapabilities,
  copyToClipboard,
  getHighAccuracyLocation,
} from '../utils/webEmergencyService';

interface EmergencyState {
  active: boolean;
  timestamp: Date | null;
  location: { latitude: number; longitude: number } | null;
  networkOnline: boolean;
  batteryLevel: number | null;
  capabilities: ReturnType<typeof checkEmergencyCapabilities>;
}

interface UseWebEmergencyReturn {
  emergencyState: EmergencyState;
  triggerEmergency: () => Promise<void>;
  cancelEmergency: () => Promise<void>;
  shareLocation: () => Promise<boolean>;
  copyLocationToClipboard: () => Promise<boolean>;
  requestPermissions: () => Promise<{
    notifications: boolean;
    location: boolean;
  }>;
  enterEmergencyMode: () => Promise<void>;
  exitEmergencyMode: () => Promise<void>;
  isWebPlatform: boolean;
}

export const useWebEmergency = (): UseWebEmergencyReturn => {
  const [emergencyState, setEmergencyState] = useState<EmergencyState>({
    active: false,
    timestamp: null,
    location: null,
    networkOnline: true,
    batteryLevel: null,
    capabilities: checkEmergencyCapabilities(),
  });

  const wakeLockRef = useRef<any>(null);
  const networkCleanupRef = useRef<(() => void) | null>(null);
  const locationWatchIdRef = useRef<number | null>(null);

  const isWebPlatform = Platform.OS === 'web';

  // Initialize network monitoring
  useEffect(() => {
    if (!isWebPlatform) return;

    // Check initial network status
    setEmergencyState((prev) => ({ ...prev, networkOnline: isOnline() }));

    // Setup network monitoring
    networkCleanupRef.current = monitorNetworkStatus(
      () => {
        setEmergencyState((prev) => ({ ...prev, networkOnline: true }));
        sendBrowserNotification({
          title: 'Connection Restored',
          body: 'Network connection is back online',
          icon: '/favicon.ico',
          requireInteraction: false,
        });
      },
      () => {
        setEmergencyState((prev) => ({ ...prev, networkOnline: false }));
        vibrateWeb([200, 100, 200]);
      }
    );

    // Check battery status
    getBatteryStatus().then((battery) => {
      if (battery) {
        setEmergencyState((prev) => ({ ...prev, batteryLevel: battery.level }));
      }
    });

    // Cleanup
    return () => {
      if (networkCleanupRef.current) {
        networkCleanupRef.current();
      }
    };
  }, [isWebPlatform]);

  // Request all necessary permissions
  const requestPermissions = useCallback(async (): Promise<{
    notifications: boolean;
    location: boolean;
  }> => {
    if (!isWebPlatform) {
      return { notifications: false, location: false };
    }

    try {
      // Request notification permission
      const notifPermission = await requestNotificationPermission();
      const notificationsGranted = notifPermission === 'granted';

      // Check location permission
      let locationGranted = false;
      try {
        await getHighAccuracyLocation();
        locationGranted = true;
      } catch (error) {
        console.error('Location permission denied:', error);
      }

      return {
        notifications: notificationsGranted,
        location: locationGranted,
      };
    } catch (error) {
      console.error('Permission request failed:', error);
      return { notifications: false, location: false };
    }
  }, [isWebPlatform]);

  // Trigger emergency
  const triggerEmergency = useCallback(async (): Promise<void> => {
    if (!isWebPlatform) {
      console.warn('Web emergency features only available on web platform');
      return;
    }

    try {
      // Get current location
      const location = await getHighAccuracyLocation();

      // Update state
      setEmergencyState((prev) => ({
        ...prev,
        active: true,
        timestamp: new Date(),
        location: { latitude: location.latitude, longitude: location.longitude },
      }));

      // Vibrate in SOS pattern
      const pattern = emergencyVibrationPattern();
      vibrateWeb(pattern);

      // Play emergency sound
      playEmergencySound();

      // Send browser notification
      await sendBrowserNotification({
        title: '🚨 EMERGENCY ACTIVATED',
        body: `Location: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`,
        requireInteraction: true,
        tag: 'emergency-active',
        actions: [
          { action: 'view', title: 'View Location' },
          { action: 'cancel', title: 'Cancel' },
        ],
      });

      console.log('Emergency triggered successfully');
    } catch (error) {
      console.error('Failed to trigger emergency:', error);
      throw error;
    }
  }, [isWebPlatform]);

  // Cancel emergency
  const cancelEmergency = useCallback(async (): Promise<void> => {
    if (!isWebPlatform) return;

    setEmergencyState((prev) => ({
      ...prev,
      active: false,
      timestamp: null,
    }));

    // Send cancellation notification
    await sendBrowserNotification({
      title: 'Emergency Cancelled',
      body: 'Emergency alert has been cancelled',
      requireInteraction: false,
      tag: 'emergency-cancelled',
    });

    console.log('Emergency cancelled');
  }, [isWebPlatform]);

  // Share location via Web Share API
  const shareLocation = useCallback(async (): Promise<boolean> => {
    if (!isWebPlatform || !emergencyState.location) {
      return false;
    }

    const { latitude, longitude } = emergencyState.location;
    const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;

    const success = await shareEmergencyWeb({
      title: 'Emergency Location',
      text: `My emergency location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
      url: mapsUrl,
    });

    if (success) {
      await sendBrowserNotification({
        title: 'Location Shared',
        body: 'Emergency location has been shared',
        requireInteraction: false,
      });
    }

    return success;
  }, [isWebPlatform, emergencyState.location]);

  // Copy location to clipboard
  const copyLocationToClipboard = useCallback(async (): Promise<boolean> => {
    if (!isWebPlatform || !emergencyState.location) {
      return false;
    }

    const { latitude, longitude } = emergencyState.location;
    const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
    const text = `Emergency Location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}\n${mapsUrl}`;

    const success = await copyToClipboard(text);

    if (success) {
      await sendBrowserNotification({
        title: 'Location Copied',
        body: 'Location copied to clipboard',
        requireInteraction: false,
      });
    }

    return success;
  }, [isWebPlatform, emergencyState.location]);

  // Enter emergency mode (fullscreen + wake lock)
  const enterEmergencyMode = useCallback(async (): Promise<void> => {
    if (!isWebPlatform) return;

    try {
      // Request wake lock to prevent screen sleep
      wakeLockRef.current = await requestWakeLock();

      // Request fullscreen for better focus
      await requestFullScreen();

      console.log('Emergency mode activated');
    } catch (error) {
      console.error('Failed to enter emergency mode:', error);
    }
  }, [isWebPlatform]);

  // Exit emergency mode
  const exitEmergencyMode = useCallback(async (): Promise<void> => {
    if (!isWebPlatform) return;

    try {
      // Release wake lock
      if (wakeLockRef.current) {
        await releaseWakeLock(wakeLockRef.current);
        wakeLockRef.current = null;
      }

      // Exit fullscreen
      await exitFullScreen();

      console.log('Emergency mode deactivated');
    } catch (error) {
      console.error('Failed to exit emergency mode:', error);
    }
  }, [isWebPlatform]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (wakeLockRef.current) {
        releaseWakeLock(wakeLockRef.current);
      }
      if (networkCleanupRef.current) {
        networkCleanupRef.current();
      }
    };
  }, []);

  return {
    emergencyState,
    triggerEmergency,
    cancelEmergency,
    shareLocation,
    copyLocationToClipboard,
    requestPermissions,
    enterEmergencyMode,
    exitEmergencyMode,
    isWebPlatform,
  };
};

export default useWebEmergency;
