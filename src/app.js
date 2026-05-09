// =====================================================
// SIPRAS-NT — Express App Setup
// =====================================================
const express = require('express');
const path = require('path');
const morgan = require('morgan');
const methodOverride = require('method-override');
const expressLayouts = require('express-ejs-layouts');
const flash = require('connect-flash');

const sessionMiddleware = require('./config/session');
const { attachUser } = require('./middleware/auth');

const app = express();

// --- View Engine ---
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', 'layouts/main');

// --- Static ---
app.use(express.static(path.join(__dirname, '..', 'public')));

// --- Body parser ---
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

// --- Logger ---
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// --- Session + Flash ---
app.use(sessionMiddleware);
app.use(flash());

// --- Inject user & flash ke semua view ---
app.use(attachUser);
app.use((req, res, next) => {
  res.locals.appName = process.env.APP_NAME || 'SIPRAS-NT';
  res.locals.flashSukses = req.flash('sukses');
  res.locals.flashError = req.flash('error');
  res.locals.flashInfo = req.flash('info');
  next();
});

// --- Routes ---
app.use('/', require('./routes/auth'));
app.use('/dashboard', require('./routes/dashboard'));
app.use('/pengguna', require('./routes/pengguna'));
app.use('/ruangan', require('./routes/ruangan'));
app.use('/barang', require('./routes/barang'));
app.use('/log-perbaikan', require('./routes/logPerbaikan'));
app.use('/laporan', require('./routes/laporan'));

// --- 404 ---
app.use((req, res) => {
  res.status(404).render('error', {
    title: '404',
    pesan: 'Halaman tidak ditemukan.',
  });
});

// --- Error handler ---
app.use(require('./middleware/errorHandler'));

module.exports = app;
