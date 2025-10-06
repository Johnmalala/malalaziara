import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, Heart, User, Shield, ArrowRight } from 'lucide-react';

const DashboardIndex: React.FC = () => {
  const { profile } = useAuth();

  const quickLinks = [
    { name: 'My Bookings', href: '/dashboard/my-bookings', icon: Calendar, description: 'View your upcoming and past trips.' },
    { name: 'My Wishlist', href: '/dashboard/my-wishlist', icon: Heart, description: 'See your saved experiences and stays.' },
    { name: 'Profile Settings', href: '/dashboard/profile', icon: User, description: 'Update your personal information.' },
    { name: 'Security', href: '/dashboard/security', icon: Shield, description: 'Change your password and manage security.' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back, {profile?.full_name?.split(' ')[0] || 'Explorer'}!
        </h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
          Here's a quick overview of your Ziarazetu account.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {quickLinks.map((link) => (
          <Link
            key={link.name}
            to={link.href}
            className="group bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex items-start space-x-4 border border-gray-200 dark:border-gray-700"
          >
            <div className="bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-300 p-3 rounded-lg">
              <link.icon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{link.name}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{link.description}</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors" />
          </Link>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Plan Your Next Adventure</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Ready for another unforgettable experience? Explore our latest experiences or create a custom package tailored just for you.
        </p>
        <div className="flex space-x-4">
          <Link to="/experiences" className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700">
            Explore Experiences
          </Link>
          <Link to="/custom-package" className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 border border-red-200 dark:border-red-400/50 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/50">
            Create Custom Package
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardIndex;
