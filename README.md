<div align="center">
   <img src="./assets/images/adaptive-icon5.png" alt="Shadow MMA Logo" width="140" />
   <h1>Shadow MMA</h1>
   <p><strong>Adaptive Shadow Boxing Trainer • Combos • Progression • Missions • Analytics</strong></p>
   <p>Built with Expo, React Native, Firebase (Auth + Firestore + Functions), RevenueCat, and Google Mobile Ads.</p>
</div>

---

## Table of Contents
1. Overview
2. Tech Stack
3. Features
4. Project Structure & Routing (Pages)
5. Getting Started (Local Dev)
6. Environment & Secrets
7. Linting & Quality
8. Combos / Content Data (Uploading to Firestore)
9. Firebase Functions & Deployment
10. Building an Android AAB (Play Store)
11. Ads & Monetization Notes
12. Troubleshooting
13. Roadmap / Next Ideas

---

## 1. Overview
Shadow MMA is a mobile training companion that delivers curated striking combinations, gamified progression, streak tracking, and weekly missions to keep users engaged. It leverages Firestore for dynamic content (combos & levels) and Firebase Auth for secure user management.

## 2. Tech Stack
- Core: React Native (Expo SDK 53) + TypeScript
- Navigation: expo-router (file‑based routing)
- Auth: Firebase Auth w/ React Native persistence
- Database: Firestore
- Cloud Functions: Node (firebase-functions, firebase-admin)
- Purchases / Paywall: RevenueCat (`react-native-purchases`)
- Ads: `react-native-google-mobile-ads`
- Animations & Haptics: Reanimated, Expo Haptics
- Media: `expo-av` for audio cues (bell, SFX)

## 3. Features
- Shadow boxing combos library with difficulty levels
- Custom fight builder (`custom-fight`)
- Progress: levels, XP bars, streak tracking, weekly missions
- Paywall & subscription plans (`plans`)
- Profile & settings (stance, preferences, volume, etc.)
- In‑fight timers, bell audio, pace + speed controls
- Quiz / training modes (files under `components` & game logic in hooks/utils)
- Offline-friendly auth persistence
- Error boundary & unified error handling (`components/ErrorBoundary.tsx`, `useErrorHandler.ts`)

## 4. Project Structure & Routing (Pages)
Located in the `app/` directory using expo-router conventions.

Top-level routes:
| File | Route | Purpose |
|------|-------|---------|
| `app/login.tsx` | `/login` | Auth screen entry |
| `app/+not-found.tsx` | 404 fallback | Not found page |

Protected group `(protected)` (auth required):
| File | Route | Purpose |
|------|-------|---------|
| `app/(protected)/custom-fight.tsx` | `/custom-fight` | Build custom session |
| `app/(protected)/plans.tsx` | `/plans` | Subscription tiers & paywall |
| `app/(protected)/settings.tsx` | `/settings` | User/account settings |

Tab group `(tabs)` inside protected:
| File | Route | Purpose |
|------|-------|---------|
| `app/(protected)/(tabs)/index.tsx` | `/` (default) | Dashboard / home hub |
| `app/(protected)/(tabs)/combos.tsx` | `/combos` | Combos library browser |
| `app/(protected)/(tabs)/gallery.tsx` | `/gallery` | Media / move gallery |
| `app/(protected)/(tabs)/game.tsx` | `/game` | Core fight / training gameplay |
| `app/(protected)/(tabs)/profile.tsx` | `/profile` | Profile & progression |

Total pages currently: 10 (including 404 & grouped layouts)

Supporting code of note:
- `contexts/` (AuthContext, UserDataContext, ConsentContext)
- `components/` (UI widgets: TimerDisplay, ComboCard, PaywallScreen, Modals, Ads, etc.)
- `utils/` (timing, animations, responsive scaling, preferences, streak logic)
- `themes/theme.ts` central theming

## 5. Getting Started (Local Dev)
1. Install dependencies:
```bash
npm install
```
2. Start development (Metro + choose platform):
```bash
npx expo start
```
3. Run on Android device / emulator (development build recommended for native modules like ads & purchases):
```bash
npm run android
```
4. (Optional) Web preview:
```bash
npm run web
```

### Development Build (Recommended)
If you haven’t created one yet, generate a dev client:
```bash
expo run:android
```
Then re-run `npx expo start --dev-client` and open on the device.

## 6. Environment & Secrets
- Firebase web config is in `FirebaseConfig.js` (public-safe keys).
- Proprietary combo/content data lives in `secrets/` (e.g., `data.js`, `combos.json`). Avoid committing sensitive future data beyond what’s intentionally public.
- RevenueCat API keys and AdMob IDs should be stored in app config or secure remote config (not shown in repo extract). Add `.env` with `EXPO_PUBLIC_...` variables if expanding.

## 7. Linting & Quality
Run lint (silent output except problems) using Expo’s lint script:
```bash
npm run -s lint
```
Fix issues automatically where possible:
```bash
npx eslint . --fix
```
Recommended: integrate with a pre-commit hook (e.g., Husky) in future.

## 8. Combos / Content Data (Uploading to Firestore)
Combos are structured in `secrets/data.js` (large MMA combinations library). To push/update them into Firestore collection `combos`:

### Data Shape (expected excerpt)
Each category object (example):
```ts
{
   id: number | string,
   category: string,        // e.g. "Beginner Boxing"
   levels: [                // array of difficulty groups
      {
         level: number,
         combos: [ { id, sequence, title, ... } ]
      }
   ]
}
```

### One-Time Upload Script (Manual Inline)
In `FirebaseConfig.js` there is a commented snippet. To use it safely:
1. Open `FirebaseConfig.js`.
2. Add imports inside the file (just below existing imports):
```js
import { doc, setDoc } from 'firebase/firestore';
import { combinationSets } from '@/secrets/data'; // adjust path if needed
```
3. Uncomment and refine the `uploadData` function:
```js
const uploadData = async () => {
   try {
      for (const category of combinationSets) {
         const categoryId = category.id.toString();
         const categoryRef = doc(db, 'combos', categoryId);
         await setDoc(categoryRef, {
            category: category.category,
            levels: category.levels
         }, { merge: true });
         console.log('Uploaded category:', category.category);
      }
      console.log('✅ All combos uploaded successfully');
   } catch (error) {
      console.error('❌ Error uploading combos:', error);
   }
};
uploadData();
```
4. Run the app (dev client) once; watch Metro logs until upload finishes.
5. Re-comment or remove the upload block to avoid re-writes on every app start.

### Alternative: Export a Dedicated Script
Create `scripts/upload-combos.ts` using the Firebase Admin SDK (safer, server-side) or reuse client config with Node + `dotenv`. (Not yet added—future enhancement.)

### Updating Combos
Modify `secrets/data.js` then repeat the upload process. Consider versioning categories with a `version` field for cache busting in future.

## 9. Firebase Functions & Deployment
Functions code lives in `functions/`. To deploy:
1. Install functions dependencies (only first time or after changes):
```bash
cd functions
npm install
cd ..
```
2. Login & set project (if not already):
```bash
firebase login
firebase use shadow-mma
```
3. Deploy only functions:
```bash
firebase deploy --only functions
```
4. Deploy Firestore rules:
```bash
firebase deploy --only firestore:rules
```
5. (Optional) Deploy everything:
```bash
firebase deploy
```
## 9.5 Problem with Async Storage --legacy--pears 

✅ Solução definitiva

Abre o package.json

Reinstala a versão correta do AsyncStorage (compatível com Firebase Auth):
```bash
npm install @react-native-async-storage/async-storage@1.24.0 --save
```
Apaga o cache local e o lockfile antigo:
```bash
rm -rf node_modules package-lock.json
npm install
```

Verifica se está na versão certa:
```bash
npm ls @react-native-async-storage/async-storage
```

Resultado esperado:
```bash
@react-native-async-storage/async-storage@1.24.0
```

Comita as mudanças:
```bash
git add package.json package-lock.json
git commit -m "fix: revert async-storage to 1.24.0 for Firebase compatibility"
git push
```

Reexecuta o build limpando o cache da EAS:
```bash
eas build --platform android --profile production --clear-cache
```

```bash
(opcional):
  "env": {
        "NPM_CONFIG_LEGACY_PEER_DEPS": "true"
      }
```
## 10. Building an Android AAB (Play Store)
You can produce a Play Store ready `.aab` either via EAS Build (recommended) or the classic `gradlew bundleRelease` if using prebuild/native.

### Option A: EAS Build (Cloud)
1. Install EAS CLI (global):
```bash
npm install -g eas-cli
```
2. Login:
```bash
eas login
```
3. Configure (first time):
```bash
eas build:configure
```
4. Trigger Android build:
```bash
eas build --platform android --profile production
```
5. Download the resulting `.aab` from the EAS dashboard and upload to Google Play Console. (don't forget to increment the versionCode in app.json for the playstore)

### Option B: Local Prebuild + Gradle
1. Generate native android project (if not already):
```bash
expo prebuild
```
2. Navigate & build:
```bash
cd android
gradlew.bat bundleRelease
```
3. Retrieve AAB at:
```
android/app/build/outputs/bundle/release/app-release.aab
```
4. Upload to Play Console → Production / Internal testing.

### Keystore Handling
- EAS manages credentials automatically (recommended).
- For local: ensure a release keystore & configure `android/app/build.gradle` signing configs.

### Versioning
Increase `version` (in `package.json`) & `android.versionCode` (if using `app.json` / `app.config.js`—add if missing) before each store upload.

## 11. Ads & Monetization Notes
- Ensure AdMob app & unit IDs are injected via config or environment before release.
- Test ads with test IDs until production launch.
- RevenueCat: verify entitlements sync when user logs in/out; clear cache on logout if needed.

## 12. Troubleshooting
| Issue | Fix |
|-------|-----|
| Metro stuck / cache weirdness | `npx expo start -c` |
| Firebase permission denied | Check Firestore rules & authenticated user state |
| Combos not appearing | Verify upload ran; check Firestore collection `combos` |
| Dev client missing native module | Re-run `expo run:android` after adding dependency |
| AAB build fails (EAS) | Inspect EAS logs; ensure correct Java / SDK versions |

## 13. Roadmap / Next Ideas
- Dedicated admin upload tool or Cloud Function trigger
- Analytics events for combo completion & streak drops
- Offline caching layer (MMKV) for combos
- iOS build & TestFlight rollout
- In-app onboarding / tutorial sequence
- Localization & multi-language support

---

### Quick Commands Reference
```bash
npm install              # install deps
npx expo start           # start dev (choose device)
npm run android          # run on Android device/emulator
npm run -s lint          # lint (problems only)
firebase deploy --only functions   # deploy cloud functions
eas build --platform android --profile production  # cloud build AAB (don't forget to increment the versionCode in app.json for the playstore)
```

### License
Currently private / All rights reserved (update if open-sourcing).

---

If you contribute, keep code modular, typed, and side-effect light. Enjoy building Shadow MMA! 🥊
