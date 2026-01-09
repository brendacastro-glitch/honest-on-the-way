const SUPABASE_CONFIG = {
    url: 'https://YOUR_PROJECT_ID.supabase.co',
    anonKey: 'YOUR_ANON_KEY'
};

// App Configuration
const APP_CONFIG = {
    appName: 'Honest Immigration Client Portal',
    version: '1.0.0',
    supportEmail: 'support@honestimigration.com',
    supportPhone: '+1 (555) 123-4567'
};

// API Endpoints (for future integration)
const API_ENDPOINTS = {
    login: '/api/auth/login',
    getCase: '/api/cases/current',
    uploadDocument: '/api/documents/upload',
    getTasks: '/api/tasks',
    getMessages: '/api/messages'
};

// Feature Flags
const FEATURES = {
    enableMagicLink: true,
    enableBiometrics: false,
    enableVideoCalls: false,
    enablePushNotifications: true
};

// Export configuration
window.APP_CONFIG = {
    supabase: SUPABASE_CONFIG,
    app: APP_CONFIG,
    api: API_ENDPOINTS,
    features: FEATURES
};

console.log(`${APP_CONFIG.appName} v${APP_CONFIG.version} configured.`);

