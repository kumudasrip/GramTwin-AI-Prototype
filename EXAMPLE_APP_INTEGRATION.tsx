import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import NewLoginPage from './components/NewLoginPage';
import Dashboard from './components/Dashboard';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Example main app structure
function AppRoutes() {
  const { isAuthenticated, user, login, loginAsCitizen, logout } = useAuth();

  if (!isAuthenticated) {
    return (
      <NewLoginPage
        onCitizenLogin={() => {
          loginAsCitizen();
          window.location.href = '/dashboard?role=citizen';
        }}
        onOrgLogin={async (email, orgType, placeName, role) => {
          login(email, orgType, placeName, role);
          window.location.href = '/dashboard?role=org';
        }}
      />
    );
  }

  return (
    <Routes>
      <Route path="/dashboard" element={<DashboardWrapper />} />
      <Route path="/" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

function DashboardWrapper() {
  const { user, logout } = useAuth();

  return (
    <div>
      <header className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">GramTwin AI Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            Role: <strong>{user.role === 'org' ? 'Organization' : 'Citizen'}</strong>
          </span>
          {user.email && <span className="text-sm text-gray-600">{user.email}</span>}
          <button
            onClick={() => {
              logout();
              window.location.href = '/';
            }}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Show different content based on role */}
      {user.role === 'citizen' && (
        <main className="p-8">
          <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
            <h2 className="text-xl font-semibold text-blue-900 mb-2">Citizen Access</h2>
            <p className="text-blue-800">
              You have read-only access. You can view maps, soil & crops data, and infrastructure information.
            </p>
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded">
                <p className="text-sm text-gray-600">Interactive Map</p>
                <p className="font-semibold">✓ Available</p>
              </div>
              <div className="bg-white p-4 rounded">
                <p className="text-sm text-gray-600">Data Editing</p>
                <p className="font-semibold text-red-600">✗ Disabled</p>
              </div>
              <div className="bg-white p-4 rounded">
                <p className="text-sm text-gray-600">Reports</p>
                <p className="font-semibold text-red-600">✗ Disabled</p>
              </div>
            </div>
          </div>
        </main>
      )}

      {user.role === 'org' && (
        <main className="p-8">
          <div className="bg-emerald-50 p-6 rounded-lg border-l-4 border-emerald-500 mb-6">
            <h2 className="text-xl font-semibold text-emerald-900 mb-2">Organization Access</h2>
            <p className="text-emerald-800">
              Welcome, {user.orgType} representing {user.placeName}. You have full access to all features.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded shadow">
              <p className="text-sm text-gray-600 mb-1">Organization</p>
              <p className="font-semibold">{user.orgType}</p>
            </div>
            <div className="bg-white p-6 rounded shadow">
              <p className="text-sm text-gray-600 mb-1">Location</p>
              <p className="font-semibold">{user.placeName}</p>
            </div>
            <div className="bg-white p-6 rounded shadow">
              <p className="text-sm text-gray-600 mb-1">Email</p>
              <p className="font-semibold text-sm">{user.email}</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded border-l-4 border-emerald-500">
              <p className="text-sm text-gray-600 mb-2">Data Editing</p>
              <p className="font-semibold text-emerald-600">✓ Enabled</p>
            </div>
            <div className="bg-white p-4 rounded border-l-4 border-emerald-500">
              <p className="text-sm text-gray-600 mb-2">Report Generation</p>
              <p className="font-semibold text-emerald-600">✓ Enabled</p>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}

// Main App component
export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}
