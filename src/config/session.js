// =====================================================
// SIPRAS-NT — Session Configuration
// Store: PostgreSQL via connect-pg-simple
// =====================================================
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);

const sessionMiddleware = session({
  store: new pgSession({
    conString: process.env.DATABASE_URL,
    tableName: 'session',
    createTableIfMissing: true,
  }),
  name: process.env.SESSION_NAME || 'sipras_nt_sid',
  secret: process.env.SESSION_SECRET || 'ubah-secret-ini-di-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 8, // 8 jam
    sameSite: 'lax',
  },
});

module.exports = sessionMiddleware;
