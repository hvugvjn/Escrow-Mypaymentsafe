import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.paxdot.app',
  appName: 'Paxdot',
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
  },
};

export default config;
