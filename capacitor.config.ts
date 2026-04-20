import { CapacitorConfig } from '@capacitor/cli';

const isUserMode = process.env.VITE_APP_MODE !== 'admin';

const config: CapacitorConfig = {
  appId: isUserMode ? 'com.venmurasu.reader' : 'com.venmurasu.admin',
  appName: isUserMode ? 'வெண்முரசு' : 'வெண்முரசு நிர்வாகம்',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
