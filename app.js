// app.js
const express = require('express');
const bodyParser = require('body-parser');
const demandeRoutes = require('./routes/demandeRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(bodyParser.json()); // To parse JSON request bodies
app.use(bodyParser.urlencoded({ extended: true })); // To parse URL-encoded request bodies

// Routes
app.use('/api/demandes', demandeRoutes);

// Catch-all for undefined routes
app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.statusCode = 404;
    next(error);
});

// Centralized error handling
app.use(errorHandler);

module.exports = app;