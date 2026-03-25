import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

interface SalesReport {
  date: string;
  total_sales: number;
  transaction_count: number;
  average_sale: number;
}

interface Transaction {
  id: string;
  cashier_id: string;
  subtotal: number;
  tax: number;
  discount_amount: number;
  total: number;
  payment_method: string;
  created_at: string;
}

const SalesReportPage: React.FC = () => {
  const [reports, setReports] = useState<SalesReport[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [startDate, setStartDate] = useState(
    format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
  );
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'summary' | 'transactions'>('summary');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError('');
      const [reportsData, transactionsData] = await Promise.all([
        window.electron.api.getSalesReport(startDate, endDate),
        window.electron.api.getTransactions(startDate, endDate),
      ]);
      setReports(reportsData);
      setTransactions(transactionsData);
    } catch (err) {
      setError('Failed to fetch reports');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = () => {
    fetchReports();
  };

  const totalSales = reports.reduce((sum, report) => sum + report.total_sales, 0);
  const totalTransactions = reports.reduce((sum, report) => sum + report.transaction_count, 0);
  const averageSale = totalTransactions > 0 ? totalSales / totalTransactions : 0;

  const handleExportCSV = () => {
    let csv = 'Date,Total Sales,Transactions,Average Sale\n';
    reports.forEach((report) => {
      csv += `${report.date},${report.total_sales},${report.transaction_count},${report.average_sale}\n`;
    });

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv));
    element.setAttribute('download', `sales-report-${startDate}-to-${endDate}.csv`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (loading && reports.length === 0) {
    return <div className="text-center py-12">Loading reports...</div>;
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="card">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Report Filters</h3>
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="label">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input-field w-full"
            />
          </div>
          <div className="flex-1">
            <label className="label">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="input-field w-full"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={handleDateRangeChange} className="btn btn-primary">
              Generate Report
            </button>
            <button onClick={handleExportCSV} className="btn btn-secondary">
              📥 Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card border-l-4 border-green-500">
          <p className="text-gray-600 text-sm font-medium">Total Sales</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            Rp{totalSales.toLocaleString('id-ID')}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {format(new Date(startDate), 'dd MMM')} - {format(new Date(endDate), 'dd MMM yyyy')}
          </p>
        </div>
        <div className="card border-l-4 border-blue-500">
          <p className="text-gray-600 text-sm font-medium">Total Transactions</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{totalTransactions}</p>
          <p className="text-xs text-gray-500 mt-2">Number of sales</p>
        </div>
        <div className="card border-l-4 border-purple-500">
          <p className="text-gray-600 text-sm font-medium">Average Sale</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">
            Rp{averageSale.toLocaleString('id-ID', { maximumFractionDigits: 0 })}
          </p>
          <p className="text-xs text-gray-500 mt-2">Per transaction</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="flex border-b border-gray-200 mb-4">
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-4 py-3 font-semibold border-b-2 transition-colors ${
              activeTab === 'summary'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            Daily Summary
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-4 py-3 font-semibold border-b-2 transition-colors ${
              activeTab === 'transactions'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            All Transactions
          </button>
        </div>

        {activeTab === 'summary' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    Total Sales
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                    Transactions
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    Average Sale
                  </th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.date} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium">
                      {format(new Date(report.date), 'dd MMM yyyy')}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-green-600">
                      Rp{report.total_sales.toLocaleString('id-ID')}
                    </td>
                    <td className="px-4 py-3 text-center text-sm">{report.transaction_count}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-right">
                      Rp
                      {report.average_sale.toLocaleString('id-ID', {
                        maximumFractionDigits: 0,
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Transaction ID
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    Subtotal
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    Discount
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Tax</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    Total
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Payment
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-mono text-gray-600">
                      {transaction.id.substring(0, 8)}...
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {format(new Date(transaction.created_at), 'dd MMM yyyy HH:mm')}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      Rp{transaction.subtotal.toLocaleString('id-ID')}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-orange-600">
                      -Rp{transaction.discount_amount.toLocaleString('id-ID')}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      Rp{transaction.tax.toLocaleString('id-ID')}
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-green-600 text-right">
                      Rp{transaction.total.toLocaleString('id-ID')}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs">
                        {transaction.payment_method.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesReportPage;
