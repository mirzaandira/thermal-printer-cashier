import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface DashboardPageProps {
  user: { id: string; name: string; role: string };
}

interface DailySales {
  total_sales: number;
  subtotal: number;
  total_tax: number;
  total_discount: number;
  transaction_count: number;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ user }) => {
  const [dailySales, setDailySales] = useState<DailySales | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDailySales();
  }, []);

  const fetchDailySales = async () => {
    try {
      setLoading(true);
      const today = format(new Date(), 'yyyy-MM-dd');
      const data = await window.electron.api.getDailySales(today);
      setDailySales(data[0] || {
        total_sales: 0,
        subtotal: 0,
        total_tax: 0,
        total_discount: 0,
        transaction_count: 0
      });
    } catch (err) {
      setError('Failed to fetch sales data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-8 shadow-lg">
        <h2 className="text-3xl font-bold mb-2">Welcome, {user.name}!</h2>
        <p className="text-blue-100">
          {format(new Date(), 'EEEE, dd MMMM yyyy', { locale: id })}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Sales */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Sales</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                Rp{dailySales?.total_sales?.toLocaleString('id-ID') || '0'}
              </p>
            </div>
            <div className="text-4xl opacity-20">💰</div>
          </div>
        </div>

        {/* Transactions */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Transactions</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {dailySales?.transaction_count || 0}
              </p>
            </div>
            <div className="text-4xl opacity-20">📊</div>
          </div>
        </div>

        {/* Total Tax */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Tax</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">
                Rp{dailySales?.total_tax?.toLocaleString('id-ID') || '0'}
              </p>
            </div>
            <div className="text-4xl opacity-20">🏛️</div>
          </div>
        </div>

        {/* Total Discount */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Discount</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">
                Rp{dailySales?.total_discount?.toLocaleString('id-ID') || '0'}
              </p>
            </div>
            <div className="text-4xl opacity-20">🎁</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/pos"
            className="flex items-center justify-center p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            🛒 New Sale
          </a>
          <a
            href="/products"
            className="flex items-center justify-center p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
          >
            📦 Manage Products
          </a>
          <a
            href="/reports"
            className="flex items-center justify-center p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
          >
            📈 View Reports
          </a>
        </div>
      </div>

      {/* Refresh Button */}
      <div className="text-center">
        <button
          onClick={fetchDailySales}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-6 rounded-lg transition-colors"
        >
          🔄 Refresh Data
        </button>
      </div>
    </div>
  );
};

export default DashboardPage;
