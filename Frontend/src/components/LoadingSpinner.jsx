const LoadingSpinner = ({ size = 'md', message = '' }) => {
  const sizes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-4',
  }

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div
        className={`${sizes[size]} animate-spin rounded-full border-blue-600 border-t-transparent`}
      />
      {message && <p className="text-sm text-gray-500">{message}</p>}
    </div>
  )
}

export default LoadingSpinner
