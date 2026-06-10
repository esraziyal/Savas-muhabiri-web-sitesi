import { Newspaper, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from '../hooks/useRouter';
import { useAuth } from '../contexts/AuthContext';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { navigate, currentPath } = useRouter();
  const { user, signOut } = useAuth();

  const navItems = [
    { label: 'Ana Sayfa', path: '/' },
    { label: 'Röportajlar', path: '/interviews' },
    { label: 'Hakkında', path: '/about' },
    { label: 'Künye', path: '/contact' },
  ];

  if (user) {
    navItems.push({ label: 'Admin', path: '/admin' });
  }

  const handleNavClick = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="bg-black border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
          >
            <Newspaper className="w-8 h-8 text-red-600" />
            <div className="text-left">
              <h1 className="text-xl font-bold text-white tracking-tight">SAVAŞ MUHABİRİ</h1>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest">War Journalist</p>
            </div>
          </button>

          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className={`text-sm font-medium tracking-wide transition-colors ${
                  currentPath === item.path
                    ? 'text-red-500'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
            {user && (
              <button
                onClick={handleSignOut}
                className="text-sm font-medium text-gray-400 hover:text-red-500 transition-colors"
              >
                Çıkış
              </button>
            )}
          </nav>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white p-2"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-gray-900 border-t border-gray-800">
          <div className="px-4 py-4 space-y-3">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className={`block w-full text-left px-4 py-2 rounded text-sm font-medium transition-colors ${
                  currentPath === item.path
                    ? 'bg-red-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                {item.label}
              </button>
            ))}
            {user && (
              <button
                onClick={handleSignOut}
                className="block w-full text-left px-4 py-2 rounded text-sm font-medium text-gray-400 hover:bg-gray-800"
              >
                Çıkış
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
