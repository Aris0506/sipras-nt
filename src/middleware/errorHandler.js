// =====================================================
// SIPRAS-NT — Global Error Handler
// =====================================================
function errorHandler(err, req, res, next) {
  console.error('🔥 Error:', err);

  const status = err.status || 500;
  const pesan =
    process.env.NODE_ENV === 'production'
      ? 'Terjadi kesalahan pada server.'
      : err.message || 'Internal Server Error';

  res.status(status).render('error', {
    title: `Error ${status}`,
    pesan,
  });
}

module.exports = errorHandler;
