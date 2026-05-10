export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="text-center">
        {/* Logo */}
        <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
          <span className="text-white font-bold text-2xl">N</span>
        </div>
        
        {/* Loading Animation */}
        <div className="flex space-x-2 justify-center mb-4">
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-3 h-3 bg-pink-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
        
        <p className="text-gray-600 text-lg">Loading NotepadX...</p>
      </div>
    </div>
  );
}