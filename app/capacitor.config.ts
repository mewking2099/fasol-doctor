import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'io.fasol.doctor',
  appName: 'Fasol Doctor',
  webDir: 'dist',
  server: {
    // Dev only — remove before production build
    androidScheme: 'https',
  },
  android: {
    backgroundColor: '#f0fdf4',
  },
  plugins: {
    Camera: {
      // Required permissions declared in AndroidManifest.xml via Capacitor
    },
  },
}

export default config
