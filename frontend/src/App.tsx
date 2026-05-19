import { Route, Routes, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import LeadsOverview from './pages/LeadsOverview';
import LeadDetails from './pages/LeadDetails';
import Analytics from './pages/Analytics';
import Login from './pages/Login';
import Register from './pages/Register';
import Unauthorized from './pages/Unauthorized';
import NotFound from './pages/NotFound';
import Layout from './components/Layout';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Protected Routes with Layout */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <LeadsOverview />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/leads"
        element={
          <ProtectedRoute>
            <Layout>
              <LeadsOverview />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/leads/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <LeadDetails />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <Layout>
              <Analytics />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Placeholder routes for sidebar items */}
      <Route
        path="/pipelines"
        element={
          <ProtectedRoute>
            <Layout>
              <div className="flex flex-col items-center justify-center min-h-[400px] text-on-surface-variant">
                <span className="material-symbols-outlined text-[48px] mb-4 opacity-30">account_tree</span>
                <h2 className="text-headline-sm mb-2">Pipelines</h2>
                <p className="text-body-md">Coming soon in Phase 2.</p>
              </div>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Layout>
              <div className="flex flex-col items-center justify-center min-h-[400px] text-on-surface-variant">
                <span className="material-symbols-outlined text-[48px] mb-4 opacity-30">settings</span>
                <h2 className="text-headline-sm mb-2">Settings</h2>
                <p className="text-body-md">Coming soon.</p>
              </div>
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
