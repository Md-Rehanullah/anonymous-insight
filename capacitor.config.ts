import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.4a547dd56e2d482a9fd193145e27d70c',
  appName: 'AtlasTHOUGHT',
  webDir: 'dist',
  server: {
    url: 'https://4a547dd5-6e2d-482a-9fd1-93145e27d70c.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#6366f1',
      showSpinner: false
    }
  }
};

export default config;