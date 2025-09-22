const express = require('express');
const router = express.Router();

// Statystyki API
let apiStats = {
  totalRequests: 0,
  endpoints: {},
  methods: {
    GET: 0,
    POST: 0,
    PUT: 0,
    DELETE: 0
  },
  statusCodes: {},
  lastReset: new Date()
};

// Middleware do zbierania statystyk
const statsMiddleware = (req, res, next) => {
  const originalSend = res.send;
  
  // Zwiększ licznik wszystkich zapytań
  apiStats.totalRequests++;
  
  // Śledzenie metod HTTP
  if (apiStats.methods[req.method]) {
    apiStats.methods[req.method]++;
  }
  
  // Śledzenie endpointów
  const endpoint = req.originalUrl;
  if (!apiStats.endpoints[endpoint]) {
    apiStats.endpoints[endpoint] = 0;
  }
  apiStats.endpoints[endpoint]++;
  
  // Nadpisanie metody send, aby przechwycić kod statusu
  res.send = function(body) {
    // Śledzenie kodów statusu
    const statusCode = res.statusCode.toString();
    if (!apiStats.statusCodes[statusCode]) {
      apiStats.statusCodes[statusCode] = 0;
    }
    apiStats.statusCodes[statusCode]++;
    
    // Wywołaj oryginalną metodę send
    return originalSend.call(this, body);
  };
  
  next();
};

// Reset statystyk
const resetStats = () => {
  apiStats = {
    totalRequests: 0,
    endpoints: {},
    methods: {
      GET: 0,
      POST: 0,
      PUT: 0,
      DELETE: 0
    },
    statusCodes: {},
    lastReset: new Date()
  };
};

// Endpoint zwracający statystyki
router.get('/stats', (req, res) => {
  const uptime = Math.floor((new Date() - apiStats.lastReset) / 1000);
  
  res.json({
    ...apiStats,
    uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${uptime % 60}s`
  });
});

// Endpoint do resetowania statystyk
router.post('/stats/reset', (req, res) => {
  resetStats();
  res.json({ message: 'Statystyki zostały zresetowane' });
});

module.exports = { router, statsMiddleware, apiStats, resetStats };
