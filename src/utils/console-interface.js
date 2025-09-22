const readline = require('readline');
const { colors, printHeader, printEndpoint } = require('./logger');
const { db } = require('../database/connection');
const { apiStats } = require('./api-stats');

class ConsoleInterface {
  constructor(app) {
    this.app = app;
    this.server = null;
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: `${colors.green}server>${colors.reset} `
    });
  }

  // Inicjalizacja interfejsu konsolowego
  init(server) {
    this.server = server;
    
    // Nasłuchiwanie na komendy
    this.rl.on('line', (line) => this.processCommand(line.trim()));
    this.rl.on('close', () => {
      console.log('Zamykanie interfejsu konsolowego...');
      process.exit(0);
    });
    
    // Wyświetl dostępne komendy
    this.showWelcomeMessage();
    this.rl.prompt();
  }

  // Wyświetlanie powitalnej wiadomości
  showWelcomeMessage() {
    console.log('\n');
    printHeader('APLIKACJA DIETETYCZNA - PANEL SERWERA', colors.cyan);
    console.log('\nDostępne komendy:');
    console.log(`${colors.yellow}help${colors.reset}         - Wyświetla listę dostępnych komend`);
    console.log(`${colors.yellow}endpoints${colors.reset}    - Wyświetla wszystkie dostępne endpointy API`);
    console.log(`${colors.yellow}routes${colors.reset}       - Alias dla 'endpoints'`);
    console.log(`${colors.yellow}status${colors.reset}       - Wyświetla status serwera`);
    console.log(`${colors.yellow}stats${colors.reset}        - Wyświetla statystyki API`);
    console.log(`${colors.yellow}users${colors.reset}        - Wyświetla listę użytkowników`);
    console.log(`${colors.yellow}meals${colors.reset}        - Wyświetla listę posiłków`);
    console.log(`${colors.yellow}restart${colors.reset}      - Restartuje serwer`);
    console.log(`${colors.yellow}clear${colors.reset}        - Czyści konsolę`);
    console.log(`${colors.yellow}exit${colors.reset}         - Zamyka serwer i kończy pracę`);
    console.log('\n');
  }

  // Przetwarzanie komend
  processCommand(command) {
    switch (command.toLowerCase()) {
      case 'help':
        this.showWelcomeMessage();
        break;
      case 'endpoints':
      case 'routes':
        this.showEndpoints();
        break;
      case 'status':
        this.showStatus();
        break;
      case 'stats':
        this.showStats();
        break;
      case 'users':
        this.listUsers();
        break;
      case 'meals':
        this.listMeals();
        break;
      case 'restart':
        this.restartServer();
        break;
      case 'clear':
        console.clear();
        break;
      case 'exit':
        this.exitServer();
        break;
      default:
        console.warn(`Nieznana komenda: ${command}`);
    }
    
    this.rl.prompt();
  }

  // Wyświetlanie endpointów
  showEndpoints() {
    printHeader('DOSTĘPNE ENDPOINTY API', colors.magenta);
    
    // Główny endpoint
    printEndpoint('GET', '/', 'Sprawdzenie czy API działa');
    
    // Statystyki systemowe
    printHeader('STATYSTYKI SYSTEMU (/api/system)', colors.cyan);
    printEndpoint('GET', '/api/system/stats', 'Pobranie statystyk API');
    printEndpoint('POST', '/api/system/stats/reset', 'Resetowanie statystyk API');
    
    // Posiłki
    printHeader('POSIŁKI (/api/meals)', colors.green);
    printEndpoint('GET', '/api/meals', 'Pobranie listy posiłków użytkownika (wymagana autoryzacja)');
    printEndpoint('GET', '/api/meals/:id', 'Pobranie pojedynczego posiłku (wymagana autoryzacja)');
    printEndpoint('POST', '/api/meals', 'Dodanie nowego posiłku (wymagana autoryzacja)');
    printEndpoint('POST', '/api/meals/with-analysis', 'Dodanie posiłku z analizą AI (wymagana autoryzacja)');
    printEndpoint('PUT', '/api/meals/:id', 'Aktualizacja posiłku (wymagana autoryzacja)');
    printEndpoint('DELETE', '/api/meals/:id', 'Usunięcie posiłku (wymagana autoryzacja)');
    printEndpoint('POST', '/api/meals/analyze', 'Analiza posiłku przez AI (wymagana autoryzacja)');
    printEndpoint('GET', '/api/meals/summary/daily', 'Pobranie dziennego podsumowania (wymagana autoryzacja)');
    printEndpoint('POST', '/api/meals/:id/share', 'Udostępnienie posiłku innemu użytkownikowi (wymagana autoryzacja)');
    
    // Raporty
    printHeader('RAPORTY (/api/reports)', colors.magenta);
    printEndpoint('GET', '/api/reports/daily', 'Pobranie raportu dziennego (wymagana autoryzacja)');
    printEndpoint('GET', '/api/reports/weekly', 'Pobranie raportu tygodniowego (wymagana autoryzacja)');
    
    // Użytkownicy
    printHeader('UŻYTKOWNICY (/api/users)', colors.blue);
    printEndpoint('POST', '/api/users/register', 'Rejestracja nowego użytkownika');
    printEndpoint('POST', '/api/users/login', 'Logowanie użytkownika');
    printEndpoint('GET', '/api/users/profile', 'Pobranie profilu użytkownika (wymagana autoryzacja)');
    printEndpoint('PUT', '/api/users/profile', 'Aktualizacja profilu użytkownika (wymagana autoryzacja)');
    printEndpoint('PUT', '/api/users/change-password', 'Zmiana hasła użytkownika (wymagana autoryzacja)');
    printEndpoint('DELETE', '/api/users/account', 'Usunięcie konta użytkownika (wymagana autoryzacja)');
    
    console.log('\n');
  }

  // Wyświetlanie statusu serwera
  showStatus() {
    const address = this.server.address();
    
    printHeader('STATUS SERWERA', colors.green);
    console.log(`${colors.cyan}Adres:${colors.reset}        ${address.address === '::' ? 'localhost' : address.address}`);
    console.log(`${colors.cyan}Port:${colors.reset}         ${address.port}`);
    console.log(`${colors.cyan}Protokół:${colors.reset}     HTTP`);
    console.log(`${colors.cyan}Czas pracy:${colors.reset}   ${this.getUptime()}`);
    console.log(`${colors.cyan}Pamięć:${colors.reset}       ${this.getMemoryUsage()}`);
    console.log('\n');
  }

  // Pobieranie czasu pracy serwera
  getUptime() {
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    
    return `${hours}h ${minutes}m ${seconds}s`;
  }

  // Pobieranie użycia pamięci
  getMemoryUsage() {
    const memoryUsage = process.memoryUsage();
    return `RSS: ${this.formatBytes(memoryUsage.rss)}, Heap: ${this.formatBytes(memoryUsage.heapUsed)}/${this.formatBytes(memoryUsage.heapTotal)}`;
  }

  // Wyświetlanie statystyk API
  showStats() {
    const uptime = Math.floor((new Date() - apiStats.lastReset) / 1000);
    const uptimeStr = `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${uptime % 60}s`;
    
    printHeader('STATYSTYKI API', colors.cyan);
    console.log(`${colors.green}Całkowita liczba żądań:${colors.reset}  ${apiStats.totalRequests}`);
    console.log(`${colors.green}Czas zbierania statystyk:${colors.reset} ${uptimeStr}`);
    
    // Metody HTTP
    printHeader('METODY HTTP', colors.yellow);
    Object.entries(apiStats.methods).forEach(([method, count]) => {
      let methodColor;
      switch (method) {
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
      console.log(`${methodColor}${method}:${colors.reset} ${count}`);
    });
    
    // Endpointy
    printHeader('NAJPOPULARNIEJSZE ENDPOINTY', colors.magenta);
    const sortedEndpoints = Object.entries(apiStats.endpoints)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
      
    if (sortedEndpoints.length === 0) {
      console.log('Brak danych o endpointach.');
    } else {
      sortedEndpoints.forEach(([endpoint, count]) => {
        console.log(`${colors.cyan}${endpoint}:${colors.reset} ${count}`);
      });
    }
    
    // Kody statusu HTTP
    printHeader('KODY STATUSU HTTP', colors.blue);
    const statusCodes = Object.entries(apiStats.statusCodes);
    
    if (statusCodes.length === 0) {
      console.log('Brak danych o kodach statusu.');
    } else {
      statusCodes.forEach(([code, count]) => {
        let statusColor;
        if (code.startsWith('2')) {
          statusColor = colors.green;
        } else if (code.startsWith('3')) {
          statusColor = colors.cyan;
        } else if (code.startsWith('4')) {
          statusColor = colors.yellow;
        } else if (code.startsWith('5')) {
          statusColor = colors.red;
        } else {
          statusColor = colors.white;
        }
        
        console.log(`${statusColor}${code}:${colors.reset} ${count}`);
      });
    }
    
    console.log('\n');
  }

  // Formatowanie bajtów do czytelnej postaci
  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  }

  // Wyświetlanie listy użytkowników
  listUsers() {
    db.all('SELECT id, email, username, created_at, weight, height, age, bmi, weight_goal FROM users', [], (err, rows) => {
      if (err) {
        console.error('Błąd podczas pobierania użytkowników:', err.message);
        return;
      }
      
      printHeader('LISTA UŻYTKOWNIKÓW', colors.yellow);
      
      if (rows.length === 0) {
        console.log('Brak użytkowników w bazie danych.');
      } else {
        console.log(`Znaleziono ${rows.length} użytkowników:\n`);
        rows.forEach(user => {
          console.log(`${colors.green}ID:${colors.reset}           ${user.id}`);
          console.log(`${colors.green}Email:${colors.reset}        ${user.email}`);
          console.log(`${colors.green}Nazwa:${colors.reset}        ${user.username}`);
          console.log(`${colors.green}Data rejestracji:${colors.reset} ${new Date(user.created_at).toLocaleString()}`);
          console.log(`${colors.green}Waga:${colors.reset}         ${user.weight ? user.weight + ' kg' : 'Nie podano'}`);
          console.log(`${colors.green}Wzrost:${colors.reset}       ${user.height ? user.height + ' cm' : 'Nie podano'}`);
          console.log(`${colors.green}Wiek:${colors.reset}         ${user.age ? user.age + ' lat' : 'Nie podano'}`);
          console.log(`${colors.green}BMI:${colors.reset}          ${user.bmi || 'Nie obliczono'}`);
          console.log(`${colors.green}Cel wagowy:${colors.reset}   ${user.weight_goal ? user.weight_goal + ' kg' : 'Nie podano'}`);
          console.log(colors.cyan + '-'.repeat(40) + colors.reset);
        });
      }
      
      console.log('\n');
    });
  }

  // Restart serwera
  restartServer() {
    console.log('Restartuję serwer...');
    
    this.server.close(() => {
      console.log('Serwer został zamknięty. Uruchamiam ponownie...');
      
      // Uruchom nowy serwer na tym samym porcie
      this.server = this.app.listen(this.server.address().port, () => {
        console.log(`Serwer został ponownie uruchomiony na porcie ${this.server.address().port}`);
      });
    });
  }

  // Zamknięcie serwera i wyjście z aplikacji
  exitServer() {
    console.log('Zamykanie serwera...');
    
    this.server.close(() => {
      console.log('Serwer został zamknięty. Żegnaj!');
      process.exit(0);
    });
  }
}

module.exports = ConsoleInterface;
