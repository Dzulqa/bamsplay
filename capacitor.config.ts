import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bamsplay.app',
  appName: 'Bamsplay',
  webDir: 'out',
  // Server config for development (live reload) - comment out for production build
  // server: {
  //   url: 'http://192.168.x.x:3000', // your local IP when testing on device
  //   cleartext: true,
  // },
  android: {
    backgroundColor: '#0b0813',
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false, // set true for debugging
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#0b0813',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
  },
};

export default config;
