import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Header from './components/layout/Header';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Groups from './pages/Groups';
import GroupDetails from './pages/GroupDetails';
import Expenses from './pages/Expenses';

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppProvider>
          <div className="min-h-screen bg-gray-50">
            <Header />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/groups"
                element={
                  <ProtectedRoute>
                    <Groups />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/groups/:groupId"
                element={
                  <ProtectedRoute>
                    <GroupDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/expenses"
                element={
                  <ProtectedRoute>
                    <Expenses />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </AppProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;