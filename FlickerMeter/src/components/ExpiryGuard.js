import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  StatusBar,
  AppState,
  Alert,
  Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import {
  EXPIRY_DAYS,
  BUILD_TIMESTAMP,
  HARDCODED_EXPIRY_DATE,
  IS_EXPIRY_ENABLED,
  CONTACT_INFO,
} from '../config/expiryConfig';

const FIRST_LAUNCH_KEY = '@flicker_meter_first_launch_time';

export default function ExpiryGuard({ children }) {
  const [isExpired, setIsExpired] = useState(false);
  const [expiryReason, setExpiryReason] = useState('');
  const [checking, setChecking] = useState(true);
  const [remainingTimeText, setRemainingTimeText] = useState('');
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    checkExpiration();

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        checkExpiration();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const checkExpiration = async () => {
    if (!IS_EXPIRY_ENABLED) {
      setChecking(false);
      setIsExpired(false);
      return;
    }

    try {
      const now = Date.now();

      // 1. Determine Target Expiration Time
      let targetExpiryTime;
      if (HARDCODED_EXPIRY_DATE) {
        targetExpiryTime = new Date(HARDCODED_EXPIRY_DATE).getTime();
      } else {
        targetExpiryTime = BUILD_TIMESTAMP + EXPIRY_DAYS * 24 * 60 * 60 * 1000;
      }

      // 2. Manage First Launch Time in Storage
      let firstLaunchStr = await AsyncStorage.getItem(FIRST_LAUNCH_KEY);
      let firstLaunchTime;

      if (!firstLaunchStr) {
        firstLaunchTime = now;
        await AsyncStorage.setItem(FIRST_LAUNCH_KEY, firstLaunchTime.toString());
      } else {
        firstLaunchTime = parseInt(firstLaunchStr, 10);
      }

      // First launch based expiry calculation
      const dynamicExpiryTime = firstLaunchTime + EXPIRY_DAYS * 24 * 60 * 60 * 1000;

      // Use the earlier of the two expiration limits (stricter security)
      const effectiveExpiryTime = Math.min(targetExpiryTime, dynamicExpiryTime);

      // Anti-Tamper Check: If current device time is set earlier than build or first launch
      if (now < BUILD_TIMESTAMP - 60000 || now < firstLaunchTime - 60000) {
        setIsExpired(true);
        setExpiryReason('Invalid System Time / Date altered back.');
        setChecking(false);
        return;
      }

      // Expiry Check
      if (now >= effectiveExpiryTime) {
        setIsExpired(true);
        setExpiryReason('4 Days Trial Period Completed.');
        setChecking(false);
        return;
      }

      // App is NOT expired: calculate remaining time for info
      const diffMs = effectiveExpiryTime - now;
      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

      setRemainingTimeText(`${days}d ${hours}h ${mins}m left`);
      setIsExpired(false);
    } catch (error) {
      console.error('Error checking APK expiration:', error);
    } finally {
      setChecking(false);
    }
  };

  if (checking) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
        <Text style={styles.loadingText}>Checking APK License...</Text>
      </View>
    );
  }

  if (isExpired) {
    const formattedExpiryDate = HARDCODED_EXPIRY_DATE
      ? new Date(HARDCODED_EXPIRY_DATE).toLocaleDateString(undefined, {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : '4 Days Limit Reached';

    return (
      <SafeAreaView style={styles.expiredContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
        <View style={styles.card}>
          <View style={styles.iconWrapper}>
            <Ionicons name="lock-closed-outline" size={56} color="#ef4444" />
          </View>

          <Text style={styles.expiredTitle}>APK Expired</Text>
          <Text style={styles.expiredSubtitleUrdu}>
            Yeh APK 4 din ke test period ke baad expire ho chuki hai.
          </Text>

          <View style={styles.badge}>
            <Ionicons name="time-outline" size={16} color="#f87171" style={{ marginRight: 6 }} />
            <Text style={styles.badgeText}>Trial Ended: {formattedExpiryDate}</Text>
          </View>

          <Text style={styles.description}>
            Is application ka 4 days trial time poora ho chuka hai. Mazeed istemal karne ke liye naye APK ya update ke liye developer se rabta karein.
          </Text>

          <View style={styles.infoBox}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Reason:</Text>
              <Text style={styles.infoValue}>{expiryReason}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>App Name:</Text>
              <Text style={styles.infoValue}>FlickerMeter Pro</Text>
            </View>

          </View>

          <TouchableOpacity
            style={styles.contactBtn}
            onPress={() => {
              Alert.alert(
                'Contact Developer',
                `Developer: ${CONTACT_INFO.developer}\nEmail: ${CONTACT_INFO.email}\n\n${CONTACT_INFO.message}`
              );
            }}
          >
            <Ionicons name="mail-outline" size={20} color="#ffffff" style={{ marginRight: 8 }} />
            <Text style={styles.contactBtnText}>Contact Support / Developer</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return children;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: 16,
    fontWeight: '500',
  },
  expiredContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  iconWrapper: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  expiredTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginBottom: 4,
  },
  expiredSubtitleUrdu: {
    fontSize: 14,
    color: '#fca5a5',
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '500',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  badgeText: {
    color: '#f87171',
    fontSize: 13,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  infoBox: {
    width: '100%',
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  infoLabel: {
    color: '#64748b',
    fontSize: 13,
  },
  infoValue: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '600',
  },
  contactBtn: {
    flexDirection: 'row',
    backgroundColor: '#ef4444',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
});
