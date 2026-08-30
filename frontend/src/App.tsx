import type { ReactNode } from 'react';
import { Navigate } from 'react-router';
import './App.css';
import Dashboard from './pages/Dashboard';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />
}

function App() {

  return (
    <>
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    </>
  );
}

export default App;
