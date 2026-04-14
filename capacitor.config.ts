import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.paxdot.app',
  appName: 'Pax',
  webDir: 'dist/public',          // Vite builds here
  server: {
    // All API calls go to your live production server
    url: 'https://www.paxdot.com',
    cleartext: false,
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: "#0a0a0c",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#6366f1",
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
};

export default config;
