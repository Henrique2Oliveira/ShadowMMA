import { useAdConsent } from '@/contexts/ConsentContext';
import { useUserData } from '@/contexts/UserDataContext';
import Constants from 'expo-constants';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';

type Props = {
	bottomOffset?: number;
	inline?: boolean;
};

export default function TopBanner({ bottomOffset = 96, inline = false }: Props) {
	const { status } = useAdConsent();
	const { userData } = useUserData();
	const [AdsComponents, setAdsComponents] = useState<null | {
		BannerAd: any;
		BannerAdSize: any;
		TestIds: any;
	}>(null);

	useEffect(() => {
		// Avoid importing the native module in Expo Go
		if (Constants.appOwnership === 'expo') return;
		// Note: We no longer wait for consent decision before loading ads
		// We'll show non-personalized ads if consent is unknown or denied
		let mounted = true;
		(async () => {
			try {
				const mod = (await import('react-native-google-mobile-ads')) as any;
				if (mounted) setAdsComponents({ BannerAd: mod.BannerAd, BannerAdSize: mod.BannerAdSize, TestIds: mod.TestIds });
			} catch {}
		})();
		return () => { mounted = false; };
	}, []);

	// Skip banner ads for users who have completed fewer than 6 fights
	// This improves initial UX and user retention
	const completedFights = userData?.lifetimeFightRounds || 0;
	if (completedFights < 6) return null;

	if (!AdsComponents) return null;
	const { BannerAd, BannerAdSize, TestIds } = AdsComponents;

	// Use Google test banner in dev; replace with your production banner unit ID when ready
	const unitId = __DEV__ ? TestIds.BANNER : 'ca-app-pub-6678510991963006/6604579282';
	if (!unitId || unitId.includes('xxxxxxxx')) {
		// No valid production unit configured yet
		if (!__DEV__) return null;
	}

	return (
		<View
			pointerEvents="auto"
			style={inline
				? { alignItems: 'center', width: '100%', marginVertical: 8 }
				: { position: 'absolute', left: 0, right: 0, bottom: bottomOffset, alignItems: 'center', zIndex: 999 }}
		>
			<BannerAd
				unitId={unitId}
				size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
				requestOptions={{ requestNonPersonalizedAdsOnly: status !== 'granted' }}
			/>
		</View>
	);
}

