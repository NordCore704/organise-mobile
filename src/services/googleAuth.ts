// src/services/googleAuth.ts
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { Platform } from 'react-native';
import { auth } from '../config/firebase';

WebBrowser.maybeCompleteAuthSession();

/** Web client — Firebase Google provider / “Web application” OAuth client */
export const GOOGLE_WEB_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

/** Android client — type “Android” with package + SHA-1 */
export const GOOGLE_ANDROID_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;

export function useGoogleAuthRequest() {
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    // Web client still used so Firebase gets a proper ID token
    clientId: GOOGLE_WEB_CLIENT_ID,
    webClientId: GOOGLE_WEB_CLIENT_ID,
    // Required on device so Google accepts the app redirect
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    // iosClientId: GOOGLE_IOS_CLIENT_ID, // add when you ship iOS
  });

  return { request, response, promptAsync };
}

export async function signInWithGoogleIdToken(idToken: string) {
  const credential = GoogleAuthProvider.credential(idToken);
  const result = await signInWithCredential(auth, credential);
  return result.user;
}