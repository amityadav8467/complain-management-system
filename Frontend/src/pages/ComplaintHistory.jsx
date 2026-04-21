import { useEffect, useState } from 'react'
import { complaintService } from '../services/complaintService'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import LoadingSpinner from '../components/LoadingSpinner'

const STATUSES = ['', 'Pending', 'In Progress', 'Resolved']
const CATEGORIES = ['', 'General', 'Technical', 'Billing', 'Service', 'Other']
const PRIORITIES = ['', 'Low', 'Medium', 'High']

const StatusBadge = ({ status }) => {
  const map = {
    Pending: 'badge-pending',
    'In Progress': 'badge-inprogress',
    Resolved: 'badge-resolved',
  }
  return <span className={map[status] || 'badge-pending'}>{status}</span>
}

const ComplaintHistory = () => {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [filters, setFilters] = useState({ status: '', category: '', priority: '', search: '' })
  const [selected, setSelected] = useState(null)

  const fetchComplaints = async (page = 1) => {
    setLoading(true)
    try {
      const params = { page, limit: 10, ...filters }
      // Remove empty filters
      Object.keys(params).forEach((k) => !params[k] && delete params[k])
      const data = await complaintService.getMyComplaints(params)
      setComplaints(data.complaints)
      setPagination(data.pagination)
    } catch {
      setError('Failed to load complaints')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchComplaints(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this complaint?')) return
    try {
      await complaintService.deleteComplaint(id)
      fetchComplaints(pagination.page)
    } catch {
      setError('Failed to delete complaint')
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-1">Complaint History</h1>
            <p className="text-gray-500 text-sm mb-6">View and manage your complaints.</p>

            {/* Filters */}
            <div className="card mb-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <input
                  type="text"
                  placeholder="Search..."
                  value={filters.search}
                  onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                  className="input-field"
                />
                <select
                  value={filters.status}
                  onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
                  className="input-field"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s || 'All Statuses'}
                    </option>
                  ))}
                </select>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
                  className="input-field"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c || 'All Categories'}
                    </option>
                  ))}
                </select>
                <select
                  value={filters.priority}
                  onChange={(e) => setFilters((f) => ({ ...f, priority: e.target.value }))}
                  className="input-field"
                >
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {p || 'All Priorities'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="card">
              {loading ? (
                <div className="flex justify-center py-12">
                  <LoadingSpinner message="Loading complaints..." />
                </div>
              ) : error ? (
                <p className="text-red-500 text-sm">{error}</p>
              ) : complaints.length === 0 ? (
                <p className="text-center text-gray-400 py-8">No complaints found</p>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-3 text-gray-500 font-medium">Title</th>
                          <th className="text-left py-3 px-3 text-gray-500 font-medium">
                            Category
                          </th>
                          <th className="text-left py-3 px-3 text-gray-500 font-medium">
                            Priority
                          </th>
                          <th className="text-left py-3 px-3 text-gray-500 font-medium">Status</th>
                          <th className="text-left py-3 px-3 text-gray-500 font-medium">Date</th>
                          <th className="text-left py-3 px-3 text-gray-500 font-medium">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {complaints.map((c) => (
                          <tr
                            key={c._id}
                            className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                          >
                            <td className="py-3 px-3 font-medium text-gray-800 max-w-xs truncate">
                              {c.title}
                            </td>
                            <td className="py-3 px-3 text-gray-600">{c.category}</td>
                            <td className="py-3 px-3">
                              <span
                                className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                  c.priority === 'High'
                                    ? 'bg-red-100 text-red-700'
                                    : c.priority === 'Medium'
                                    ? 'bg-orange-100 text-orange-700'
                                    : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                {c.priority}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <StatusBadge status={c.status} />
                            </td>
                            <td className="py-3 px-3 text-gray-500">
                              {new Date(c.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => setSelected(c)}
                                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                                >
                                  View
                                </button>
                                {c.status === 'Pending' && (
                                  <button
                                    onClick={() => handleDelete(c._id)}
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
                      Showing {complaints.length} of {pagination.total} complaints
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => fetchComplaints(pagination.page - 1)}
                        disabled={pagination.page <= 1}
                        className="btn-secondary text-xs py-1 px-3 disabled:opacity-40"
                      >
                        ← Prev
                      </button>
                      <span className="text-sm text-gray-600 px-2 py-1">
                        {pagination.page} / {pagination.pages}
                      </span>
                      <button
                        onClick={() => fetchComplaints(pagination.page + 1)}
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

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">{selected.title}</h2>
              <button
                onClick={() => setSelected(null)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex gap-2">
                <StatusBadge status={selected.status} />
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    selected.priority === 'High'
                      ? 'bg-red-100 text-red-700'
                      : selected.priority === 'Medium'
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {selected.priority}
                </span>
              </div>
              <p className="text-gray-500">
                <strong>Category:</strong> {selected.category}
              </p>
              <p className="text-gray-500">
                <strong>Submitted:</strong>{' '}
                {new Date(selected.createdAt).toLocaleDateString()}
              </p>
              <div>
                <strong className="text-gray-700">Description:</strong>
                <p className="text-gray-600 mt-1 whitespace-pre-wrap">{selected.description}</p>
              </div>
              {selected.adminNote && (
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                  <strong className="text-blue-700 text-xs">Admin Note:</strong>
                  <p className="text-blue-600 text-xs mt-1">{selected.adminNote}</p>
                </div>
              )}
              {selected.assignedTo && (
                <p className="text-gray-500">
                  <strong>Assigned To:</strong> {selected.assignedTo.name}
                </p>
              )}
              {selected.attachments?.length > 0 && (
                <div>
                  <strong className="text-gray-700">Attachments:</strong>
                  <ul className="mt-1 space-y-1">
                    {selected.attachments.map((att, i) => (
                      <li key={i} className="text-xs text-blue-600">
                        📎 {att.originalname}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <button onClick={() => setSelected(null)} className="btn-secondary mt-4 w-full">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ComplaintHistory
