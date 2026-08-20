require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  // The frontend's origin, for CORS. Comma-separated for more than one
  // (e.g. a deployed URL alongside local dev).
  clientOrigins: (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim()),
  // How often the mother-notification due/overdue scan runs (see server.js
  // and src/services/notificationEngine.js).
  notificationScanIntervalHours: Number(process.env.NOTIFICATION_SCAN_INTERVAL_HOURS) || 24,

  // Twilio (see src/services/smsProvider.js). All optional -- if unset, SMS
  // sending falls back to a console-log stub so the app still runs without
  // an SMS account. TWILIO_MESSAGING_SERVICE_SID takes priority over
  // TWILIO_PHONE_NUMBER when both are set (needed for an alphanumeric
  // sender ID, e.g. required for reliable delivery in Zimbabwe).
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER,
    messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID,
  },
};
