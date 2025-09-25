@echo off
echo ===================================
echo Uruchamianie frontendu
echo ===================================
echo.

cd C:\Users\szczo\Desktop\ProjektDiet\Projekt-Dietetyczny\frontend

REM Sprawdź port 3000 (Frontend)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
    echo Znaleziono proces na porcie 3000, kończę proces %%a...
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo Naprawiam package.json...
powershell -Command "(Get-Content package.json) -replace '\"type\": \"module\"', '\"type\": \"commonjs\"' | Set-Content package.json"

echo.
echo Naprawiam postcss.config.js...
echo module.exports = { > postcss.config.js
echo   plugins: { >> postcss.config.js
echo     tailwindcss: {}, >> postcss.config.js
echo     autoprefixer: {}, >> postcss.config.js
echo   } >> postcss.config.js
echo } >> postcss.config.js

echo.
echo Naprawiam index.css...
echo @tailwind base; > src\index.css
echo @tailwind components; >> src\index.css
echo @tailwind utilities; >> src\index.css
echo. >> src\index.css
echo @layer base { >> src\index.css
echo   * { >> src\index.css
echo     /* Usunięto problematyczną linię: @apply border-border; */ >> src\index.css
echo   } >> src\index.css
echo   body { >> src\index.css
echo     @apply bg-background text-foreground; >> src\index.css
echo   } >> src\index.css
echo } >> src\index.css
echo. >> src\index.css
echo @layer components { >> src\index.css
echo   .card { >> src\index.css
echo     @apply bg-white rounded-lg shadow-sm border border-gray-200; >> src\index.css
echo   } >> src\index.css
echo   >> src\index.css
echo   .btn-primary { >> src\index.css
echo     @apply bg-primary-600 hover:bg-primary-700 text-white font-medium px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2; >> src\index.css
echo   } >> src\index.css
echo   >> src\index.css
echo   .btn-secondary { >> src\index.css
echo     @apply bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2; >> src\index.css
echo   } >> src\index.css
echo   >> src\index.css
echo   .input { >> src\index.css
echo     @apply w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors; >> src\index.css
echo   } >> src\index.css
echo   >> src\index.css
echo   .label { >> src\index.css
echo     @apply block text-sm font-medium text-gray-700 mb-1; >> src\index.css
echo   } >> src\index.css
echo } >> src\index.css
echo. >> src\index.css
echo :root { >> src\index.css
echo   --background: 0 0%% 100%%; >> src\index.css
echo   --foreground: 222.2 84%% 4.9%%; >> src\index.css
echo   --card: 0 0%% 100%%; >> src\index.css
echo   --card-foreground: 222.2 84%% 4.9%%; >> src\index.css
echo   --popover: 0 0%% 100%%; >> src\index.css
echo   --popover-foreground: 222.2 84%% 4.9%%; >> src\index.css
echo   --primary: 142.1 76.2%% 36.3%%; >> src\index.css
echo   --primary-foreground: 355.7 100%% 97.3%%; >> src\index.css
echo   --secondary: 210 40%% 98%%; >> src\index.css
echo   --secondary-foreground: 222.2 84%% 4.9%%; >> src\index.css
echo   --muted: 210 40%% 96%%; >> src\index.css
echo   --muted-foreground: 215.4 16.3%% 46.9%%; >> src\index.css
echo   --accent: 210 40%% 96%%; >> src\index.css
echo   --accent-foreground: 222.2 84%% 4.9%%; >> src\index.css
echo   --destructive: 0 84.2%% 60.2%%; >> src\index.css
echo   --destructive-foreground: 210 40%% 98%%; >> src\index.css
echo   --border: 214.3 31.8%% 91.4%%; >> src\index.css
echo   --input: 214.3 31.8%% 91.4%%; >> src\index.css
echo   --ring: 142.1 76.2%% 36.3%%; >> src\index.css
echo   --radius: 0.5rem; >> src\index.css
echo } >> src\index.css

echo.
echo Tworzę poprawny plik vite.config.js...
echo // vite.config.js > vite.config.js
echo const { defineConfig } = require('vite'); >> vite.config.js
echo const react = require('@vitejs/plugin-react'); >> vite.config.js
echo const path = require('path'); >> vite.config.js
echo. >> vite.config.js
echo // https://vitejs.dev/config/ >> vite.config.js
echo module.exports = defineConfig({ >> vite.config.js
echo   plugins: [react()], >> vite.config.js
echo   resolve: { >> vite.config.js
echo     alias: { >> vite.config.js
echo       '@': path.resolve(__dirname, './src'), >> vite.config.js
echo     }, >> vite.config.js
echo   }, >> vite.config.js
echo   server: { >> vite.config.js
echo     port: 3000, >> vite.config.js
echo     host: true, >> vite.config.js
echo     proxy: { >> vite.config.js
echo       '/api': { >> vite.config.js
echo         target: 'http://localhost:5000', >> vite.config.js
echo         changeOrigin: true, >> vite.config.js
echo         secure: false, >> vite.config.js
echo       }, >> vite.config.js
echo     }, >> vite.config.js
echo     hmr: { >> vite.config.js
echo       overlay: false, >> vite.config.js
echo     }, >> vite.config.js
echo   }, >> vite.config.js
echo }); >> vite.config.js

echo.
echo Tworzę poprawny plik tailwind.config.js...
echo /** @type {import('tailwindcss').Config} */ > tailwind.config.js
echo module.exports = { >> tailwind.config.js
echo   content: [ >> tailwind.config.js
echo     "./index.html", >> tailwind.config.js
echo     "./src/**/*.{js,ts,jsx,tsx}", >> tailwind.config.js
echo   ], >> tailwind.config.js
echo   theme: { >> tailwind.config.js
echo     extend: { >> tailwind.config.js
echo       colors: { >> tailwind.config.js
echo         border: "rgb(229 231 235)", >> tailwind.config.js
echo         background: "rgb(255 255 255)", >> tailwind.config.js
echo         foreground: "rgb(17 24 39)", >> tailwind.config.js
echo         primary: { >> tailwind.config.js
echo           50: '#f0fdf4', >> tailwind.config.js
echo           100: '#dcfce7', >> tailwind.config.js
echo           200: '#bbf7d0', >> tailwind.config.js
echo           300: '#86efac', >> tailwind.config.js
echo           400: '#4ade80', >> tailwind.config.js
echo           500: '#22c55e', >> tailwind.config.js
echo           600: '#16a34a', >> tailwind.config.js
echo           700: '#15803d', >> tailwind.config.js
echo           800: '#166534', >> tailwind.config.js
echo           900: '#14532d', >> tailwind.config.js
echo         }, >> tailwind.config.js
echo       }, >> tailwind.config.js
echo       animation: { >> tailwind.config.js
echo         'fade-in': 'fadeIn 0.3s ease-in-out', >> tailwind.config.js
echo         'slide-up': 'slideUp 0.3s ease-out', >> tailwind.config.js
echo       }, >> tailwind.config.js
echo       keyframes: { >> tailwind.config.js
echo         fadeIn: { >> tailwind.config.js
echo           '0%%': { opacity: '0' }, >> tailwind.config.js
echo           '100%%': { opacity: '1' }, >> tailwind.config.js
echo         }, >> tailwind.config.js
echo         slideUp: { >> tailwind.config.js
echo           '0%%': { transform: 'translateY(10px)', opacity: '0' }, >> tailwind.config.js
echo           '100%%': { transform: 'translateY(0)', opacity: '1' }, >> tailwind.config.js
echo         }, >> tailwind.config.js
echo       }, >> tailwind.config.js
echo     }, >> tailwind.config.js
echo   }, >> tailwind.config.js
echo   plugins: [], >> tailwind.config.js
echo } >> tailwind.config.js

echo.
echo Instalacja zależności...
call npm install --no-audit --no-fund

echo.
echo Uruchamiam frontend na porcie 3000...
npx vite --host

echo.
echo Frontend zatrzymany.
echo.
pause