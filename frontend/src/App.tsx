import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navbar } from '@/components/Navbar';

// Pages
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { AddMealPage } from '@/pages/AddMealPage';
import { MealPhotoAnalysisPage } from '@/pages/MealPhotoAnalysisPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              {/* Protected routes */}
              <Route path="/*" element={
                <ProtectedRoute>
                  <Navbar />
                  <Routes>
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/meals" element={<div className="p-8">Meals page - coming soon</div>} />
                    <Route path="/meals/add" element={<AddMealPage />} />
                    <Route path="/meals/photo-analysis" element={<MealPhotoAnalysisPage />} />
                    <Route path="/ai-analysis" element={<div className="p-8">AI analysis page - coming soon</div>} />
                    <Route path="/reports" element={<div className="p-8">Reports page - coming soon</div>} />
                    <Route path="/profile" element={<div className="p-8">Profile page - coming soon</div>} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </ProtectedRoute>
              } />
            </Routes>
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
              }}
            />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
