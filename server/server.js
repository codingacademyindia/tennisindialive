const express = require('express');
const cors = require('cors');
const app = express();
const port = 5000;
const routes = require('./routes/index');

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON bodies

// Use routes
app.use('/', routes);

// Start server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
