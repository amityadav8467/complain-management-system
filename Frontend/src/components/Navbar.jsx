import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isAdmin = user?.role === 'admin' || user?.role === 'staff'

  return (
    <nav className="bg-blue-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            to={isAdmin ? '/admin/dashboard' : '/dashboard'}
            className="text-xl font-bold tracking-wide hover:text-blue-200 transition-colors"
          >
            🛡️ ComplainMS
          </Link>
          {user && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-blue-200">
                {user.name} ({user.role})
              </span>
              <button
                onClick={handleLogout}
                className="text-sm bg-blue-800 hover:bg-blue-900 px-3 py-1.5 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
