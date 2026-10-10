import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ar.ticketscan.app',
  appName: 'TicketScan',
  webDir: 'out',
  server: {
    androidScheme: 'https',
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystorePassword: undefined,
      keystoreAlias: undefined,
      keystoreAliasPassword: undefined,
      releaseType: 'APK',
    },
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true,
  },
  plugins: {
    Camera: {
      permissions: ['camera'],
    },
    Filesystem: {
      permissions: ['read', 'write'],
    },
    Network: {},
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#00ABE4',
      showSpinner: false,
    },
    StatusBar: {
      style: 'default',
      backgroundColor: '#00ABE4',
    },
  },
};

export default config;