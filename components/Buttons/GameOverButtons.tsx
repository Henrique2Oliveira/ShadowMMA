import { useAdConsent } from '@/contexts/ConsentContext';
import { useUserData } from '@/contexts/UserDataContext';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { LevelBar } from '../LevelBar';

export const GameOverButtons: React.FC = () => {
  const { userData } = useUserData();
  const { status: adConsentStatus } = useAdConsent();
  const [displayXp, setDisplayXp] = useState(userData?.xp || 0);
  const [busy, setBusy] = useState(false);
  const navigatedRef = useRef(false);

  useEffect(() => {
    // Calculate start and end XP values
    const startXp = (userData?.xp || 0) - 25; // Previous XP
    const endXp = userData?.xp || 0; // New XP
    
    let frameCount = 0;
    const totalFrames = 50; // Number of steps in the counting animation
    let animationFrame: number;
    
    const animateCount = () => {
      frameCount++;
      
      if (frameCount <= totalFrames) {
        // Use easeOut effect for smooth deceleration
        const progress = 1 - Math.pow(1 - frameCount / totalFrames, 3);
        const currentXp = startXp + Math.floor((endXp - startXp) * progress);
        setDisplayXp(currentXp);
        
        animationFrame = requestAnimationFrame(animateCount);
      } else {
        // Animation complete
        setDisplayXp(endXp);
      }
    };

    // Start animation after a delay
    const timeoutId = setTimeout(() => {
      animateCount();
    }, 100);

    return () => {
      cancelAnimationFrame(animationFrame);
      clearTimeout(timeoutId);
    };

  }, [userData?.xp]);

  const handleReturnPress = useCallback(async () => {
    if (busy || navigatedRef.current) return;
    const plan = (userData?.plan || 'free').toLowerCase();
    const completedFights = userData?.lifetimeFightRounds || 0;

    // Only show interstitial for free users, Android, and not in Expo Go
    // Skip ads for the first 6 fights to improve initial UX and user retention
    const shouldShowAd = plan === 'free' && completedFights >= 6 && Platform.OS === 'android' && Constants.appOwnership !== 'expo';

    const navigateHome = () => {
      if (navigatedRef.current) return;
      navigatedRef.current = true;
      router.push('/');
    };

    // Navigate home if ads shouldn't be shown
    if (!shouldShowAd) {
      navigateHome();
      return;
    }

    setBusy(true);
    try {
      const ads = (await import('react-native-google-mobile-ads')) as any;
      const { InterstitialAd, AdEventType, TestIds } = ads;

      // Use test ID in dev. For production, replace with your real interstitial unit ID
      const unitId = __DEV__ ? TestIds.INTERSTITIAL : 'ca-app-pub-6678510991963006/4151420738';
      if (!unitId || unitId.includes('xxxxxxxx')) {
        // No valid production ID configured -> skip showing ad
        navigateHome();
        return;
      }

      // Request non-personalized ads if consent is unknown or denied (GDPR compliance)
      const interstitial = InterstitialAd.createForAdRequest(unitId, { 
        requestNonPersonalizedAdsOnly: adConsentStatus !== 'granted' 
      });
      let timeoutId: ReturnType<typeof setTimeout> | null = null;

      const onClosed = () => {
        if (timeoutId) clearTimeout(timeoutId);
        navigateHome();
      };
      const onError = () => {
        if (timeoutId) clearTimeout(timeoutId);
        navigateHome();
      };
      const onLoaded = () => {
        try { interstitial.show(); } catch {
          onError();
        }
      };

      interstitial.addAdEventListener(AdEventType.CLOSED, onClosed);
      interstitial.addAdEventListener(AdEventType.ERROR, onError);
      interstitial.addAdEventListener(AdEventType.LOADED, onLoaded);

      // Fallback in case loading is slow
      timeoutId = setTimeout(onError, 4000);
      interstitial.load();
    } catch {
      navigateHome();
    } finally {
      setBusy(false);
    }
  }, [busy, userData?.plan, userData?.lifetimeFightRounds, adConsentStatus]);

  return (
    <>
      <View style={styles.levelBarContainer}>
        <LevelBar xp={displayXp} />
      </View>
      <View style={styles.gameOverButtonsContainer}>
        <TouchableOpacity
          style={styles.gameOverButton}
          onPress={handleReturnPress}
          disabled={busy}
        >
          <Ionicons
            name="arrow-back-outline"
            size={34}
            color={'rgb(255, 255, 255)'}
          />
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  levelBarContainer: {
    position: 'absolute',
    top: -200,
    width: '100%',
    alignItems: 'center',
  },
  gameOverButtonsContainer: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    bottom: 100,
  },
  gameOverButton: {
    width: 80,
    height: 80,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(27, 27, 27, 1)',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
