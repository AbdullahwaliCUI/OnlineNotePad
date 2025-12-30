import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="container-custom">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
              NotepadX
            </Link>
          </div>

          {/* Auth Area */}
          <div className="flex items-center space-x-4">
            <Link 
              href="/signin" 
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Sign In
            </Link>
            <Link 
              href="/signup" 
              className="btn-primary"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}