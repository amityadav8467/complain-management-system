import { useEffect, useState } from 'react'
import { userService } from '../services/complaintService'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import LoadingSpinner from '../components/LoadingSpinner'

const ROLES = ['', 'user', 'staff', 'admin']

const AdminUsers = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [filters, setFilters] = useState({ search: '', role: '' })
  const [editModal, setEditModal] = useState(null)
  const [editData, setEditData] = useState({})
  const [actionLoading, setActionLoading] = useState(false)

  const fetchUsers = async (page = 1) => {
    setLoading(true)
    try {
      const params = { page, limit: 10, ...filters }
      Object.keys(params).forEach((k) => !params[k] && delete params[k])
      const data = await userService.getAllUsers(params)
      setUsers(data.users)
      setPagination(data.pagination)
    } catch {
      setError('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user? This cannot be undone.')) return
    try {
      await userService.deleteUser(id)
      fetchUsers(pagination.page)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user')
    }
  }

  const handleUpdate = async () => {
    setActionLoading(true)
    try {
      await userService.updateUser(editModal._id, editData)
      setEditModal(null)
      fetchUsers(pagination.page)
    } catch {
      setError('Failed to update user')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-1">User Management</h1>
            <p className="text-gray-500 text-sm mb-6">View and manage all registered users.</p>

            {/* Filters */}
            <div className="card mb-6">
              <div className="grid grid-cols-2 gap-3 max-w-md">
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={filters.search}
                  onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                  className="input-field"
                />
                <select
                  value={filters.role}
                  onChange={(e) => setFilters((f) => ({ ...f, role: e.target.value }))}
                  className="input-field"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r || 'All Roles'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="card">
              {loading ? (
                <div className="flex justify-center py-12">
                  <LoadingSpinner message="Loading users..." />
                </div>
              ) : users.length === 0 ? (
                <p className="text-center text-gray-400 py-8">No users found</p>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-3 text-gray-500 font-medium">Name</th>
                          <th className="text-left py-3 px-3 text-gray-500 font-medium">Email</th>
                          <th className="text-left py-3 px-3 text-gray-500 font-medium">Role</th>
                          <th className="text-left py-3 px-3 text-gray-500 font-medium">Phone</th>
                          <th className="text-left py-3 px-3 text-gray-500 font-medium">Status</th>
                          <th className="text-left py-3 px-3 text-gray-500 font-medium">Joined</th>
                          <th className="text-left py-3 px-3 text-gray-500 font-medium">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u) => (
                          <tr
                            key={u._id}
                            className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                          >
                            <td className="py-3 px-3 font-medium text-gray-800">{u.name}</td>
                            <td className="py-3 px-3 text-gray-600">{u.email}</td>
                            <td className="py-3 px-3">
                              <span
                                className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                  u.role === 'admin'
                                    ? 'bg-purple-100 text-purple-700'
                                    : u.role === 'staff'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                {u.role}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-gray-500">{u.phone || '—'}</td>
                            <td className="py-3 px-3">
                              <span
                                className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                  u.isActive
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-red-100 text-red-700'
                                }`}
                              >
                                {u.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-gray-500">
                              {new Date(u.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    setEditModal(u)
                                    setEditData({
                                      name: u.name,
                                      email: u.email,
                                      role: u.role,
                                      phone: u.phone || '',
                                      address: u.address || '',
                                      isActive: u.isActive,
                                    })
                                  }}
                                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                                >
                                  Edit
                                </button>
                                {u.role !== 'admin' && (
                                  <button
                                    onClick={() => handleDelete(u._id)}
                                    className="text-xs text-red-500 hover:text-red-700 font-medium"
                                  >
                                    Delete
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-500">
                      Showing {users.length} of {pagination.total} users
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => fetchUsers(pagination.page - 1)}
                        disabled={pagination.page <= 1}
                        className="btn-secondary text-xs py-1 px-3 disabled:opacity-40"
                      >
                        ← Prev
                      </button>
                      <span className="text-sm text-gray-600 px-2 py-1">
                        {pagination.page} / {pagination.pages}
                      </span>
                      <button
                        onClick={() => fetchUsers(pagination.page + 1)}
                        disabled={pagination.page >= pagination.pages}
                        className="btn-secondary text-xs py-1 px-3 disabled:opacity-40"
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Edit User Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Edit User</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData((d) => ({ ...d, name: e.target.value }))}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData((d) => ({ ...d, email: e.target.value }))}
                  className="input-field"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={editData.role}
                    onChange={(e) => setEditData((d) => ({ ...d, role: e.target.value }))}
                    className="input-field"
                  >
                    {['user', 'staff', 'admin'].map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={editData.isActive ? 'active' : 'inactive'}
                    onChange={(e) =>
                      setEditData((d) => ({ ...d, isActive: e.target.value === 'active' }))
                    }
                    className="input-field"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={editData.phone}
                  onChange={(e) => setEditData((d) => ({ ...d, phone: e.target.value }))}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  value={editData.address}
                  onChange={(e) => setEditData((d) => ({ ...d, address: e.target.value }))}
                  className="input-field"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleUpdate}
                disabled={actionLoading}
                className="btn-primary flex-1"
              >
                {actionLoading ? <LoadingSpinner size="sm" /> : 'Save Changes'}
              </button>
              <button onClick={() => setEditModal(null)} className="btn-secondary flex-1">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminUsers
