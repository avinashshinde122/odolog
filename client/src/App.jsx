import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './hooks/useAuth.js';
import LoginScreen from './screens/LoginScreen.jsx';
import GarageScreen from './screens/GarageScreen.jsx';
import VehicleDetailScreen from './screens/VehicleDetailScreen.jsx';
import AddServiceLogScreen from './screens/AddServiceLogScreen.jsx';
import LogDetailScreen from './screens/LogDetailScreen.jsx';

function ProtectedRoute({ isAuthenticated, children }) {
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const { isAuthenticated, loading, logout } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-ink-muted text-sm">Loading…</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/vehicles" replace /> : <LoginScreen />} />
      <Route
        path="/vehicles"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <GarageScreen onLogout={logout} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vehicles/:vehicleId"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <VehicleDetailScreen />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vehicles/:vehicleId/logs/new"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <AddServiceLogScreen />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vehicles/:vehicleId/logs/:logId"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <LogDetailScreen />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to={isAuthenticated ? '/vehicles' : '/login'} replace />} />
    </Routes>
  );
}
