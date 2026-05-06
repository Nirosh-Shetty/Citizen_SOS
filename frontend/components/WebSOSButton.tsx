/**
 * Web SOS Button Component
 * Optimized emergency button with web-specific features
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useWebEmergency } from '../hooks/useWebEmergency';

interface WebSOSButtonProps {
  onEmergencyTriggered?: (location: { latitude: number; longitude: number }) => void;
  onEmergencyCancelled?: () => void;
  size?: 'small' | 'medium' | 'large';
  showCapabilities?: boolean;
}

const WebSOSButton: React.FC<WebSOSButtonProps> = ({
  onEmergencyTriggered,
  onEmergencyCancelled,
  size = 'large',
  showCapabilities = false,
}) => {
  const {
    emergencyState,
    triggerEmergency,
    cancelEmergency,
    shareLocation,
    copyLocationToClipboard,
    requestPermissions,
    enterEmergencyMode,
    exitEmergencyMode,
    isWebPlatform,
  } = useWebEmergency();

  const [isTriggering, setIsTriggering] = useState(false);
  const [pressTimer, setPressTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [progress, setProgress] = useState(0);
  const [permissionsGranted, setPermissionsGranted] = useState({ notifications: false, location: false });

  const isWeb = Platform.OS === 'web';

  // Check permissions on mount
  useEffect(() => {
    if (isWeb) {
      requestPermissions().then((perms) => {
        setPermissionsGranted(perms);
      });
    }
  }, [isWeb]);

  // Handle emergency state changes
  useEffect(() => {
    if (emergencyState.active && emergencyState.location) {
      onEmergencyTriggered?.(emergencyState.location);
    } else if (!emergencyState.active && onEmergencyCancelled) {
      onEmergencyCancelled();
    }
  }, [emergencyState.active, emergencyState.location]);

  const handlePressIn = () => {
    if (emergencyState.active) return;

    setIsTriggering(true);
    setProgress(0);

    // Start progress animation
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 50);

    // Trigger after 1 second hold
    const timer = setTimeout(async () => {
      clearInterval(interval);
      setProgress(100);
      await handleEmergency();
      setIsTriggering(false);
      setProgress(0);
    }, 1000);

    setPressTimer(timer);
  };

  const handlePressOut = () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
    }
    setIsTriggering(false);
    setProgress(0);
  };

  const handleEmergency = async () => {
    try {
      if (!permissionsGranted.location || !permissionsGranted.notifications) {
        const perms = await requestPermissions();
        setPermissionsGranted(perms);
        
        if (!perms.location) {
          alert('Location permission is required for emergency features');
          return;
        }
      }

      await triggerEmergency();
      await enterEmergencyMode();
    } catch (error) {
      console.error('Emergency trigger failed:', error);
      alert('Failed to trigger emergency. Please try again.');
    }
  };

  const handleCancel = async () => {
    await cancelEmergency();
    await exitEmergencyMode();
  };

  const handleShare = async () => {
    const success = await shareLocation();
    if (!success) {
      // Fallback to clipboard if Web Share not available
      await copyLocationToClipboard();
      alert('Location copied to clipboard');
    }
  };

  const buttonSizes = {
    small: { width: 120, height: 120, iconSize: 40, fontSize: 18 },
    medium: { width: 160, height: 160, iconSize: 50, fontSize: 22 },
    large: { width: 200, height: 200, iconSize: 60, fontSize: 28 },
  };

  const currentSize = buttonSizes[size];

  if (!isWeb) {
    return (
      <View style={styles.unsupportedContainer}>
        <Text style={styles.unsupportedText}>Web features only available on web platform</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {showCapabilities && (
        <View style={styles.capabilitiesRow}>
          <View style={[styles.capabilityBadge, permissionsGranted.notifications && styles.capabilityGranted]}>
            <MaterialIcons name="notifications" size={16} color={permissionsGranted.notifications ? '#10B981' : '#6B7280'} />
            <Text style={[styles.capabilityText, permissionsGranted.notifications && styles.capabilityTextGranted]}>
              Notifications
            </Text>
          </View>
          <View style={[styles.capabilityBadge, permissionsGranted.location && styles.capabilityGranted]}>
            <MaterialIcons name="my-location" size={16} color={permissionsGranted.location ? '#10B981' : '#6B7280'} />
            <Text style={[styles.capabilityText, permissionsGranted.location && styles.capabilityTextGranted]}>
              Location
            </Text>
          </View>
          {emergencyState.capabilities.vibration && (
            <View style={[styles.capabilityBadge, styles.capabilityGranted]}>
              <MaterialIcons name="vibration" size={16} color="#10B981" />
              <Text style={[styles.capabilityText, styles.capabilityTextGranted]}>Vibration</Text>
            </View>
          )}
          {!emergencyState.networkOnline && (
            <View style={[styles.capabilityBadge, styles.capabilityOffline]}>
              <MaterialIcons name="wifi-off" size={16} color="#EF4444" />
              <Text style={[styles.capabilityText, { color: '#EF4444' }]}>Offline</Text>
            </View>
          )}
        </View>
      )}

      {!emergencyState.active ? (
        <TouchableOpacity
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.9}
          style={[styles.buttonContainer, { width: currentSize.width, height: currentSize.height }]}>
          <LinearGradient
            colors={isTriggering ? ['#DC2626', '#EF4444', '#F87171'] : ['#EF4444', '#DC2626', '#B91C1C']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.gradient, { borderRadius: currentSize.width / 2 }]}>
            {isTriggering && (
              <View style={[styles.progressRing, { width: currentSize.width - 20, height: currentSize.height - 20, borderRadius: (currentSize.width - 20) / 2 }]}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${progress}%`,
                      height: '100%',
                      borderRadius: (currentSize.width - 20) / 2,
                    },
                  ]}
                />
              </View>
            )}
            <MaterialIcons name="emergency" size={currentSize.iconSize} color="#FFF" />
            <Text style={[styles.buttonText, { fontSize: currentSize.fontSize }]}>SOS</Text>
            <Text style={styles.buttonSubtext}>Press & Hold</Text>
          </LinearGradient>
        </TouchableOpacity>
      ) : (
        <View style={styles.activeContainer}>
          <View style={[styles.activeButton, { width: currentSize.width, height: currentSize.height }]}>
            <LinearGradient
              colors={['#7F1D1D', '#991B1B']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.gradient, { borderRadius: currentSize.width / 2 }]}>
              <MaterialIcons name="emergency" size={currentSize.iconSize} color="#FFF" />
              <Text style={[styles.activeText, { fontSize: currentSize.fontSize - 4 }]}>ACTIVE</Text>
              {emergencyState.timestamp && (
                <Text style={styles.timestampText}>
                  {new Date(emergencyState.timestamp).toLocaleTimeString()}
                </Text>
              )}
            </LinearGradient>
          </View>

          <View style={styles.actionsRow}>
            <TouchableOpacity onPress={handleShare} style={styles.actionButton}>
              <MaterialIcons name="share" size={24} color="#3B82F6" />
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={copyLocationToClipboard} style={styles.actionButton}>
              <MaterialIcons name="content-copy" size={24} color="#10B981" />
              <Text style={styles.actionText}>Copy</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleCancel} style={[styles.actionButton, styles.cancelButton]}>
              <MaterialIcons name="close" size={24} color="#EF4444" />
              <Text style={[styles.actionText, { color: '#EF4444' }]}>Cancel</Text>
            </TouchableOpacity>
          </View>

          {emergencyState.location && (
            <View style={styles.locationInfo}>
              <MaterialIcons name="location-on" size={20} color="#6B7280" />
              <Text style={styles.locationText}>
                {emergencyState.location.latitude.toFixed(6)}, {emergencyState.location.longitude.toFixed(6)}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 16,
  },
  unsupportedContainer: {
    padding: 20,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  unsupportedText: {
    color: '#6B7280',
    fontSize: 14,
    textAlign: 'center',
  },
  capabilitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  capabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  capabilityGranted: {
    backgroundColor: '#D1FAE5',
    borderColor: '#10B981',
  },
  capabilityOffline: {
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
  },
  capabilityText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  capabilityTextGranted: {
    color: '#10B981',
  },
  buttonContainer: {
    position: 'relative',
  },
  gradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  progressRing: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    marginTop: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  buttonSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginTop: 4,
  },
  activeContainer: {
    alignItems: 'center',
    gap: 16,
  },
  activeButton: {
    position: 'relative',
  },
  activeText: {
    color: '#FFF',
    fontWeight: 'bold',
    marginTop: 8,
  },
  timestampText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginTop: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cancelButton: {
    borderColor: '#FCA5A5',
    backgroundColor: '#FEE2E2',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  locationText: {
    fontSize: 12,
    color: '#4B5563',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});

export default WebSOSButton;
