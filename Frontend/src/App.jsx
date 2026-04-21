import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import UserDashboard from './pages/UserDashboard'
import SubmitComplaint from './pages/SubmitComplaint'
import ComplaintHistory from './pages/ComplaintHistory'
import AdminDashboard from './pages/AdminDashboard'
import AdminComplaints from './pages/AdminComplaints'
import AdminUsers from './pages/AdminUsers'
import NotFound from './pages/NotFound'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* User routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute roles={['user', 'staff']}>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/submit-complaint"
            element={
              <ProtectedRoute roles={['user', 'staff']}>
                <SubmitComplaint />
              </ProtectedRoute>
            }
          />
          <Route
            path="/complaints"
            element={
              <ProtectedRoute roles={['user', 'staff']}>
                <ComplaintHistory />
              </ProtectedRoute>
            }
          />

          {/* Admin routes */}
          <Route path="/admin/login" element={<Login isAdmin />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute roles={['admin', 'staff']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/complaints"
            element={
              <ProtectedRoute roles={['admin', 'staff']}>
                <AdminComplaints />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminUsers />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
