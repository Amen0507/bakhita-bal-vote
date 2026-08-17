import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import Candidates from './pages/Candidates'
import Register from './pages/Register'
import Vote from './pages/Vote'
import Results from './pages/Results'
import AdminLogin from './pages/admin/Login'
import AdminDashboard from './pages/admin/Dashboard'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/candidates" element={<Layout><Candidates /></Layout>} />
          <Route path="/register" element={<Layout><Register /></Layout>} />
          <Route path="/vote" element={<Layout><Vote /></Layout>} />
          <Route path="/results" element={<Layout><Results /></Layout>} />

          {/* Admin routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
