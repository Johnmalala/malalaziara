import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User, LogOut, Settings, MapPin } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../UI/Button';
import CurrencySwitcher from './CurrencySwitcher';
import ThemeSwitcher from './ThemeSwitcher';

const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const location = useLocation();

  const navigationItems = [
    { name: 'Experiences', href: '/experiences' },
    { name: 'Stays', href: '/stays' },
    { name: 'Volunteers', href: '/volunteers' },
    { name: 'Custom Package', href: '/custom-package' },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      setUserMenuOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="bg-white dark:bg-gray-900 shadow-lg dark:shadow-gray-800/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-primary-600 text-white p-2 rounded-lg">
              <MapPin size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Ziarazetu</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Discover East Africa</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`text-sm font-medium transition-colors duration-200 hover:text-primary-600 dark:hover:text-primary-400 ${
                  location.pathname === item.href
                    ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400 pb-1'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-2">
            <div className="hidden sm:block">
              <CurrencySwitcher />
            </div>
            <ThemeSwitcher />
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/50 rounded-full flex items-center justify-center">
                    <User size={16} className="text-primary-600 dark:text-primary-300" />
                  </div>
                  <span className="hidden sm:block text-sm font-medium">
                    {profile?.full_name || 'User'}
                  </span>
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 z-50 border border-gray-200 dark:border-gray-700"
                    >
                      <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{profile?.full_name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{profile?.email}</p>
                        {profile?.role === 'admin' && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900/50 text-primary-800 dark:text-primary-200 mt-1">
                            Admin
                          </span>
                        )}
                      </div>
                      <Link
                        to="/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Settings size={16} className="inline mr-2" />
                        Dashboard
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <LogOut size={16} className="inline mr-2" />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden sm:flex items-center space-x-2">
                <Link to="/signin">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link to="/signup">
                  <Button variant="primary" size="sm">Sign Up</Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-200 dark:border-gray-700"
            >
              <div className="py-4 space-y-2">
                <div className="px-4">
                  <CurrencySwitcher />
                </div>
                {navigationItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`block px-4 py-2 text-sm font-medium transition-colors duration-200 hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-primary-400 ${
                      location.pathname === item.href
                        ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/50 dark:text-primary-300'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                {!user && (
                  <div className="px-4 py-2 space-y-2">
                    <Link to="/signin" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" size="sm" className="w-full">Sign In</Button>
                    </Link>
                    <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="primary" size="sm" className="w-full">Sign Up</Button>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Header;
