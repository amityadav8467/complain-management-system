import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Sidebar = () => {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin' || user?.role === 'staff'

  const userLinks = [
    { to: '/dashboard', label: '🏠 Dashboard' },
    { to: '/submit-complaint', label: '📝 Submit Complaint' },
    { to: '/complaints', label: '📋 My Complaints' },
  ]

  const adminLinks = [
    { to: '/admin/dashboard', label: '📊 Dashboard' },
    { to: '/admin/complaints', label: '📋 All Complaints' },
    ...(user?.role === 'admin' ? [{ to: '/admin/users', label: '👥 Users' }] : []),
  ]

  const links = isAdmin ? adminLinks : userLinks

  return (
    <aside className="w-64 min-h-screen bg-gray-800 text-gray-100 flex flex-col py-6 px-3">
      <nav className="flex flex-col gap-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
