import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { complaintService } from '../services/complaintService'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import LoadingSpinner from '../components/LoadingSpinner'

const StatCard = ({ label, value, color, icon }) => (
  <div className={`card border-l-4 ${color} flex items-center gap-4`}>
    <div className="text-3xl">{icon}</div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-3xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
)

const AdminDashboard = () => {
  const [stats, setStats] = useState(null)
  const [recentComplaints, setRecentComplaints] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, complaintsData] = await Promise.all([
          complaintService.getStats(),
          complaintService.getAllComplaints({ limit: 5 }),
        ])
        setStats(statsData.stats)
        setRecentComplaints(complaintsData.complaints)
      } catch (err) {
        console.error('Error loading dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <LoadingSpinner size="lg" message="Loading dashboard..." />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-1">Admin Dashboard</h1>
            <p className="text-gray-500 text-sm mb-6">Overview of complaint management system.</p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard
                label="Total Complaints"
                value={stats?.total || 0}
                color="border-blue-500"
                icon="📋"
              />
              <StatCard
                label="Pending"
                value={stats?.pending || 0}
                color="border-yellow-500"
                icon="⏳"
              />
              <StatCard
                label="In Progress"
                value={stats?.inProgress || 0}
                color="border-indigo-500"
                icon="🔄"
              />
              <StatCard
                label="Resolved"
                value={stats?.resolved || 0}
                color="border-green-500"
                icon="✅"
              />
            </div>

            {/* Quick links */}
            <div className="flex gap-3 mb-8">
              <Link to="/admin/complaints" className="btn-primary">
                Manage Complaints
              </Link>
              <Link to="/admin/users" className="btn-secondary">
                Manage Users
              </Link>
            </div>

            {/* Category breakdown */}
            {stats?.byCategory?.length > 0 && (
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="card">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">By Category</h2>
                  <div className="space-y-2">
                    {stats.byCategory.map((item) => (
                      <div key={item._id} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{item._id}</span>
                        <span className="text-sm font-semibold text-gray-800 bg-gray-100 px-2 py-0.5 rounded">
                          {item.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="card">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">By Priority</h2>
                  <div className="space-y-2">
                    {stats.byPriority.map((item) => (
                      <div key={item._id} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{item._id}</span>
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            item._id === 'High'
                              ? 'bg-red-100 text-red-700'
                              : item._id === 'Medium'
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {item.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Recent complaints */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Recent Complaints</h2>
                <Link
                  to="/admin/complaints"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View all →
                </Link>
              </div>
              {recentComplaints.length === 0 ? (
                <p className="text-center text-gray-400 py-6">No complaints yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 px-3 text-gray-500 font-medium">Title</th>
                        <th className="text-left py-2 px-3 text-gray-500 font-medium">User</th>
                        <th className="text-left py-2 px-3 text-gray-500 font-medium">Category</th>
                        <th className="text-left py-2 px-3 text-gray-500 font-medium">Status</th>
                        <th className="text-left py-2 px-3 text-gray-500 font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentComplaints.map((c) => (
                        <tr key={c._id} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="py-2 px-3 font-medium text-gray-800 max-w-xs truncate">
                            {c.title}
                          </td>
                          <td className="py-2 px-3 text-gray-600">{c.userId?.name}</td>
                          <td className="py-2 px-3 text-gray-600">{c.category}</td>
                          <td className="py-2 px-3">
                            <span
                              className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                c.status === 'Resolved'
                                  ? 'bg-green-100 text-green-700'
                                  : c.status === 'In Progress'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}
                            >
                              {c.status}
                            </span>
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

export default AdminDashboard
