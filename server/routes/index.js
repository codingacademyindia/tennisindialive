const express = require('express');
const router = express.Router();
const apiRoutes = require('./apiRoutes');

// Use API routes
router.use('/tennis', apiRoutes);

module.exports = router;
