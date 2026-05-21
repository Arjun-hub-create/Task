const { isDbReady } = require('../config/db');

const ensureDb = (req, res, next) => {
  if (isDbReady()) {
    return next();
  }

  return res.status(503).json({
    success: false,
    message:
      'Database is not available. Check MongoDB is running and MONGODB_URI is correct.',
    code: 'DATABASE_UNAVAILABLE',
  });
};

module.exports = ensureDb;
