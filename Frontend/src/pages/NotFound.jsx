import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="text-8xl font-bold text-blue-600 mb-4">404</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Page Not Found</h1>
        <p className="text-gray-500 mb-8">The page you are looking for does not exist.</p>
        <Link to="/" className="btn-primary">
          Go to Home
        </Link>
      </div>
    </div>
  )
}

export default NotFound
