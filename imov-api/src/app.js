require('dotenv').config();
const express = require('express');
const tripRoutes = require('./routes/tripRoutes');

const app = express();

app.use(express.static('public'));
app.use(express.json());

// Registro das rotas
app.use('/api', tripRoutes);

module.exports = app;