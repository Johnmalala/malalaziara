import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  MapPin, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Package
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { supabase } from '../../lib/supabase';
import { LoadingSpinner } from '../../components/UI/LoadingSpinner';
import { useCurrency } from '../../contexts/CurrencyContext';

interface DashboardStats {
  totalListings: number;
  totalBookings: number;
  totalPartners: number;
  totalRequests: number;
  totalRevenue: number;
  totalUsers: number;
}

export function AdminDashboard() {
  const { convert } = useCurrency();
  const [stats, setStats] = useState<DashboardStats>({
    totalListings: 0,
    totalBookings: 0,
    totalPartners: 0,
    totalRequests: 0,
    totalRevenue: 0,
    totalUsers: 0,
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch statistics
      const [
        { count: listingsCount },
        { count: bookingsCount },
        { count: partnersCount },
        { count: requestsCount },
        { count: usersCount },
        { data: bookings }
      ] = await Promise.all([
        supabase.from('listings').select('*', { count: 'exact', head: true }),
        supabase.from('bookings').select('*', { count: 'exact', head: true }),
        supabase.from('partners').select('*', { count: 'exact', head: true }),
        supabase.from('custom_package_requests').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('bookings').select('amount, created_at, status')
      ]);

      // Calculate revenue
      const totalRevenue = bookings?.reduce((sum, booking) => {
        return booking.status === 'confirmed' ? sum + booking.amount : sum;
      }, 0) || 0;

      setStats({
        totalListings: listingsCount || 0,
        totalBookings: bookingsCount || 0,
        totalPartners: partnersCount || 0,
        totalRequests: requestsCount || 0,
        totalRevenue,
        totalUsers: usersCount || 0,
      });

      // Generate chart data for the last 6 months
      const monthlyData = generateMonthlyData(bookings || []);
      setChartData(monthlyData);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMonthlyData = (bookings: any[]) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map((month, index) => ({
      month,
      bookings: Math.floor(Math.random() * 50) + 10, // Mock data for demonstration
      revenue: Math.floor(Math.random() * 10000) + 2000,
    }));
  };

  if (loading) {
    return <LoadingSpinner size="lg" className="min-h-screen" />;
  }

  const statCards = [
    {
      title: 'Total Listings',
      value: stats.totalListings,
      icon: MapPin,
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      title: 'Active Bookings',
      value: stats.totalBookings,
      icon: Calendar,
      color: 'bg-green-500',
      change: '+18%'
    },
    {
      title: 'Partners',
      value: stats.totalPartners,
      icon: Users,
      color: 'bg-purple-500',
      change: '+5%'
    },
    {
      title: 'Package Requests',
      value: stats.totalRequests,
      icon: Package,
      color: 'bg-orange-500',
      change: '+23%'
    },
    {
      title: 'Total Revenue',
      value: convert(stats.totalRevenue),
      icon: DollarSign,
      color: 'bg-red-500',
      change: '+15%'
    },
    {
      title: 'Registered Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-indigo-500',
      change: '+8%'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome to Ziarazetu Admin Portal - East Africa Tourism Management
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-500 font-medium">{card.change}</span>
                    <span className="text-sm text-gray-500 ml-1">vs last month</span>
                  </div>
                </div>
                <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Bookings Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Bookings</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="bookings" fill="#dc2626" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#dc2626" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="bg-white rounded-xl shadow-lg p-6 mt-8"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <MapPin className="w-6 h-6 text-red-600 mb-2" />
            <h4 className="font-medium text-gray-900">Add New Listing</h4>
            <p className="text-sm text-gray-500">Create a new tour, stay, or volunteer program</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <Calendar className="w-6 h-6 text-red-600 mb-2" />
            <h4 className="font-medium text-gray-900">View Bookings</h4>
            <p className="text-sm text-gray-500">Manage customer bookings and reservations</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <Users className="w-6 h-6 text-red-600 mb-2" />
            <h4 className="font-medium text-gray-900">Add Partner</h4>
            <p className="text-sm text-gray-500">Register new tourism partners</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <Package className="w-6 h-6 text-red-600 mb-2" />
            <h4 className="font-medium text-gray-900">Package Requests</h4>
            <p className="text-sm text-gray-500">Review custom package requests</p>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
