const express = require('express');
const { home, health } = require('./handlers');

const app = express();

app.get('/', home);

app.get('/health', health);

module.exports = app;
