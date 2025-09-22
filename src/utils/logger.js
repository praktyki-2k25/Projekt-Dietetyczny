const fs = require('fs');
const path = require('path');
const util = require('util');

// Kolory dla konsoli
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',
  
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  
  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m'
};

// Upewnij się, że istnieje katalog na logi
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Tworzenie strumienia pliku dla logów
const logFile = fs.createWriteStream(
  path.join(logsDir, `server_${new Date().toISOString().split('T')[0]}.log`),
  { flags: 'a' }
);

// Funkcja opakowująca dla standardowego console.log
const originalConsoleLog = console.log;

// Funkcja do formatowania czasu
const getTimestamp = () => {
  const now = new Date();
  return `${now.toISOString().replace('T', ' ').substr(0, 19)}`;
};

// Nadpisanie standardowych metod console
console.log = function() {
  const timestamp = getTimestamp();
  const args = Array.from(arguments);
  const logMessage = `[${timestamp}] [INFO] ${util.format.apply(null, args)}`;
  
  // Zapisz do pliku bez kolorów
  logFile.write(logMessage.replace(/\x1b\[[0-9;]*m/g, '') + '\n');
  
  // Wyświetl w konsoli z kolorami
  originalConsoleLog.call(console, `${colors.green}${logMessage}${colors.reset}`);
};

console.info = function() {
  const timestamp = getTimestamp();
  const args = Array.from(arguments);
  const logMessage = `[${timestamp}] [INFO] ${util.format.apply(null, args)}`;
  
  logFile.write(logMessage.replace(/\x1b\[[0-9;]*m/g, '') + '\n');
  originalConsoleLog.call(console, `${colors.cyan}${logMessage}${colors.reset}`);
};

console.warn = function() {
  const timestamp = getTimestamp();
  const args = Array.from(arguments);
  const logMessage = `[${timestamp}] [WARN] ${util.format.apply(null, args)}`;
  
  logFile.write(logMessage.replace(/\x1b\[[0-9;]*m/g, '') + '\n');
  originalConsoleLog.call(console, `${colors.yellow}${logMessage}${colors.reset}`);
};

console.error = function() {
  const timestamp = getTimestamp();
  const args = Array.from(arguments);
  const logMessage = `[${timestamp}] [ERROR] ${util.format.apply(null, args)}`;
  
  logFile.write(logMessage.replace(/\x1b\[[0-9;]*m/g, '') + '\n');
  originalConsoleLog.call(console, `${colors.red}${logMessage}${colors.reset}`);
};

// Funkcja do wyświetlania nagłówka
const printHeader = (text, color = colors.magenta) => {
  const line = '='.repeat(text.length + 4);
  originalConsoleLog.call(console, `${color}${line}${colors.reset}`);
  originalConsoleLog.call(console, `${color}= ${text} =${colors.reset}`);
  originalConsoleLog.call(console, `${color}${line}${colors.reset}`);
};

// Funkcja do wyświetlania informacji o endpointach
const printEndpoint = (method, path, description) => {
  let methodColor;
  switch (method.toUpperCase()) {
    case 'GET':
      methodColor = colors.green;
      break;
    case 'POST':
      methodColor = colors.yellow;
      break;
    case 'PUT':
      methodColor = colors.blue;
      break;
    case 'DELETE':
      methodColor = colors.red;
      break;
    default:
      methodColor = colors.white;
  }
  
  originalConsoleLog.call(console, `${methodColor}${method.toUpperCase().padEnd(7)}${colors.reset} ${colors.cyan}${path.padEnd(30)}${colors.reset} ${description}`);
};

// Funkcja do wyświetlania informacji o żądaniach HTTP
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Nasłuchuj na zakończenie odpowiedzi, aby zapisać czas trwania
  res.on('finish', () => {
    const duration = Date.now() - start;
    const message = `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`;
    
    // Wybierz kolor na podstawie kodu statusu
    if (res.statusCode >= 500) {
      console.error(message);
    } else if (res.statusCode >= 400) {
      console.warn(message);
    } else {
      console.log(message);
    }
  });
  
  next();
};

// Wyeksportuj narzędzia do logowania
module.exports = {
  colors,
  printHeader,
  printEndpoint,
  requestLogger,
};
