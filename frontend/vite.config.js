// vite.config.js 
const { defineConfig } = require('vite'); 
const react = require('@vitejs/plugin-react'); 
const path = require('path'); 
 
// https://vitejs.dev/config/ 
module.exports = defineConfig({ 
  plugins: [react()], 
  resolve: { 
    alias: { 
      '@': path.resolve(__dirname, './src'), 
    }, 
  }, 
  server: { 
    port: 3000, 
    host: true, 
    proxy: { 
      '/api': { 
        target: 'http://localhost:5000', 
        changeOrigin: true, 
        secure: false, 
      }, 
    }, 
    hmr: { 
      overlay: false, 
    }, 
  }, 
}); 
