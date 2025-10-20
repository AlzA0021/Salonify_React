import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 space-x-reverse">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl font-bold">F</span>
            </div>
            <span className="text-xl font-bold text-gray-900">فرشا</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6 space-x-reverse">
            <Link to="/search" className="text-gray-700 hover:text-primary-600 transition-colors">
              جستجو
            </Link>
            <Link to="/search?category=haircut" className="text-gray-700 hover:text-primary-600 transition-colors">
              آرایشگاه
            </Link>
            <Link to="/search?category=spa" className="text-gray-700 hover:text-primary-600 transition-colors">
              اسپا و ماساژ
            </Link>
            <Link to="/search?category=beauty" className="text-gray-700 hover:text-primary-600 transition-colors">
              زیبایی
            </Link>
            <Link to="/partner/login" className="text-gray-700 hover:text-primary-600 transition-colors">
              برای کسب‌وکارها
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4 space-x-reverse">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center space-x-2 space-x-reverse focus:outline-none"
                >
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-medium">
                      {user?.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <span className="text-gray-700">{user?.name}</span>
                </button>

                {isMenuOpen && (
                  <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 animate-fade-in">
                    <Link
                      to="/my-bookings"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      رزروهای من
                    </Link>
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      پروفایل
                    </Link>
                    <hr className="my-2" />
                    <button
                      onClick={handleLogout}
                      className="w-full text-right px-4 py-2 text-red-600 hover:bg-gray-50"
                    >
                      خروج
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-primary-600 transition-colors">
                  ورود
                </Link>
                <Link to="/register" className="btn-primary">
                  ثبت‌نام
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t animate-fade-in">
            <div className="flex flex-col space-y-3">
              <Link to="/search" className="text-gray-700 hover:text-primary-600">
                جستجو
              </Link>
              <Link to="/search?category=haircut" className="text-gray-700 hover:text-primary-600">
                آرایشگاه
              </Link>
              <Link to="/search?category=spa" className="text-gray-700 hover:text-primary-600">
                اسپا و ماساژ
              </Link>
              <Link to="/search?category=beauty" className="text-gray-700 hover:text-primary-600">
                زیبایی
              </Link>
              <Link to="/partner/login" className="text-gray-700 hover:text-primary-600">
                برای کسب‌وکارها
              </Link>
              
              {isAuthenticated ? (
                <>
                  <hr />
                  <Link to="/my-bookings" className="text-gray-700 hover:text-primary-600">
                    رزروهای من
                  </Link>
                  <Link to="/profile" className="text-gray-700 hover:text-primary-600">
                    پروفایل
                  </Link>
                  <button onClick={handleLogout} className="text-right text-red-600">
                    خروج
                  </button>
                </>
              ) : (
                <>
                  <hr />
                  <Link to="/login" className="text-gray-700 hover:text-primary-600">
                    ورود
                  </Link>
                  <Link to="/register" className="btn-primary text-center">
                    ثبت‌نام
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;