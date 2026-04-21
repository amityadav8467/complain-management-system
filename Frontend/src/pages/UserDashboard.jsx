import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { complaintService } from '../services/complaintService'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import LoadingSpinner from '../components/LoadingSpinner'

const StatusBadge = ({ status }) => {
  const map = {
    Pending: 'badge-pending',
    'In Progress': 'badge-inprogress',
    Resolved: 'badge-resolved',
  }
  return <span className={map[status] || 'badge-pending'}>{status}</span>
}

const StatCard = ({ label, value, color }) => (
  <div className={`card border-l-4 ${color}`}>
    <p className="text-sm text-gray-500">{label}</p>
    <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
  </div>
)

const UserDashboard = () => {
  const { user } = useAuth()
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const data = await complaintService.getMyComplaints({ limit: 5 })
        setComplaints(data.complaints)
      } catch {
        setError('Failed to load complaints')
      } finally {
        setLoading(false)
      }
    }
    fetchComplaints()
  }, [])

  const stats = {
    total: complaints.length,
    pending: complaints.filter((c) => c.status === 'Pending').length,
    inProgress: complaints.filter((c) => c.status === 'In Progress').length,
    resolved: complaints.filter((c) => c.status === 'Resolved').length,
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-1">
              Welcome, {user?.name}! 👋
            </h1>
            <p className="text-gray-500 text-sm mb-6">
              Here&apos;s an overview of your recent complaints.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard label="Total" value={stats.total} color="border-blue-500" />
              <StatCard label="Pending" value={stats.pending} color="border-yellow-500" />
              <StatCard label="In Progress" value={stats.inProgress} color="border-indigo-500" />
              <StatCard label="Resolved" value={stats.resolved} color="border-green-500" />
            </div>

            {/* Quick actions */}
            <div className="flex gap-3 mb-8">
              <Link to="/submit-complaint" className="btn-primary">
                + Submit Complaint
              </Link>
              <Link to="/complaints" className="btn-secondary">
                View All Complaints
              </Link>
            </div>

            {/* Recent complaints */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Complaints</h2>
              {loading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner message="Loading..." />
                </div>
              ) : error ? (
                <p className="text-red-500 text-sm">{error}</p>
              ) : complaints.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400 text-lg">No complaints yet</p>
                  <Link to="/submit-complaint" className="text-blue-600 text-sm mt-2 inline-block">
                    Submit your first complaint →
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-2 px-3 text-gray-500 font-medium">Title</th>
                        <th className="text-left py-2 px-3 text-gray-500 font-medium">Category</th>
                        <th className="text-left py-2 px-3 text-gray-500 font-medium">Priority</th>
                        <th className="text-left py-2 px-3 text-gray-500 font-medium">Status</th>
                        <th className="text-left py-2 px-3 text-gray-500 font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {complaints.map((c) => (
                        <tr key={c._id} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="py-2 px-3 font-medium text-gray-800">{c.title}</td>
                          <td className="py-2 px-3 text-gray-600">{c.category}</td>
                          <td className="py-2 px-3">
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
                          <td className="py-2 px-3">
                            <StatusBadge status={c.status} />
                          </td>
                          <td className="py-2 px-3 text-gray-500">
                            {new Date(c.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default UserDashboard
