import React, { useState, useEffect } from 'react';

interface Product {
  id: string;
  name: string;
  price: number;
  sku?: string;
}

interface InventoryItem {
  id: string;
  product_id: string;
  quantity: number;
  reorder_level: number;
  last_restocked?: string;
  name?: string;
  price?: number;
  sku?: string;
}

const InventoryPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLowStock, setFilterLowStock] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const productsData = await window.electron.api.getProducts();
      setProducts(productsData);

      // Fetch inventory for each product
      const inventoryData = await Promise.all(
        productsData.map(async (product) => {
          const inv = await window.electron.api.getInventory(product.id);
          return inv
            ? {
                ...inv,
                name: product.name,
                price: product.price,
                sku: product.sku,
              }
            : null;
        })
      );

      setInventory(inventoryData.filter(Boolean) as InventoryItem[]);
    } catch (err) {
      setError('Failed to fetch inventory data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (productId: string, newQuantity: number) => {
    try {
      await window.electron.api.updateInventory(productId, newQuantity);
      await fetchData();
    } catch (err) {
      setError('Failed to update inventory');
      console.error(err);
    }
  };

  const handleRestockProduct = (productId: string) => {
    const currentInventory = inventory.find((item) => item.product_id === productId);
    if (!currentInventory) return;

    const restockQuantity = prompt(
      `Enter restock quantity for ${currentInventory.name}:`,
      currentInventory.reorder_level.toString()
    );

    if (restockQuantity) {
      const newQuantity = currentInventory.quantity + parseInt(restockQuantity);
      handleUpdateQuantity(productId, newQuantity);
    }
  };

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku?.includes(searchTerm);

    const matchesFilter = !filterLowStock || item.quantity <= item.reorder_level;

    return matchesSearch && matchesFilter;
  });

  const lowStockItems = inventory.filter((item) => item.quantity <= item.reorder_level);
  const totalValue = inventory.reduce((sum, item) => sum + item.quantity * (item.price || 0), 0);

  if (loading) {
    return <div className="text-center py-12">Loading inventory...</div>;
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card border-l-4 border-blue-500">
          <p className="text-gray-600 text-sm font-medium">Total Items</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {inventory.reduce((sum, item) => sum + item.quantity, 0)}
          </p>
        </div>
        <div className="card border-l-4 border-red-500">
          <p className="text-gray-600 text-sm font-medium">Low Stock Items</p>
          <p className="text-3xl font-bold text-red-600 mt-2">{lowStockItems.length}</p>
        </div>
        <div className="card border-l-4 border-green-500">
          <p className="text-gray-600 text-sm font-medium">Inventory Value</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            Rp{totalValue.toLocaleString('id-ID')}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <input
            type="text"
            placeholder="Search by product name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field flex-1"
          />
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filterLowStock}
              onChange={(e) => setFilterLowStock(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-700">Show only low stock</span>
          </label>
          <button onClick={fetchData} className="btn btn-secondary">
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Product</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">SKU</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Current Stock</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Reorder Level</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Status</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Value</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInventory.map((item) => {
              const isLowStock = item.quantity <= item.reorder_level;
              const value = item.quantity * (item.price || 0);
              return (
                <tr
                  key={item.id}
                  className={`border-b ${isLowStock ? 'bg-red-50' : 'hover:bg-gray-50'}`}
                >
                  <td className="px-4 py-3 text-sm font-medium">{item.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{item.sku || '-'}</td>
                  <td className="px-4 py-3 text-center">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        handleUpdateQuantity(item.product_id, parseInt(e.target.value) || 0)
                      }
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-center text-sm font-semibold"
                    />
                  </td>
                  <td className="px-4 py-3 text-center text-sm">{item.reorder_level}</td>
                  <td className="px-4 py-3 text-center">
                    {isLowStock ? (
                      <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-semibold">
                        ⚠️ Low Stock
                      </span>
                    ) : (
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                        ✓ In Stock
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-semibold">
                    Rp{value.toLocaleString('id-ID')}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleRestockProduct(item.product_id)}
                      className="text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      📥 Restock
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-bold text-yellow-800 mb-3">⚠️ Low Stock Alert</h3>
          <div className="space-y-2">
            {lowStockItems.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-sm">
                <span className="text-yellow-900">
                  {item.name}: {item.quantity} units (reorder at {item.reorder_level})
                </span>
                <button
                  onClick={() => handleRestockProduct(item.product_id)}
                  className="text-blue-600 hover:text-blue-800 font-semibold text-xs"
                >
                  Restock
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;
