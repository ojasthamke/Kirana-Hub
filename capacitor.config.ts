import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kiranahub.app',
  appName: 'KiranaHub',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    url: 'https://kiranahub.vercel.app',
    cleartext: true
  },
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
    CapacitorCookies: {
      enabled: true,
    },
  },
};

export default config;
