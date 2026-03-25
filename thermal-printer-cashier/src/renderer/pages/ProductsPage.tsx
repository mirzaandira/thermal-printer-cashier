import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface Product {
  id: string;
  name: string;
  price: number;
  cost?: number;
  sku?: string;
  category_id: string;
  active: boolean;
}

interface Category {
  id: string;
  name: string;
}

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    cost: 0,
    sku: '',
    category_id: '',
    quantity: 0,
  });

  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsData, categoriesData] = await Promise.all([
        window.electron.api.getProducts(),
        window.electron.api.getCategories(),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (err) {
      setError('Failed to fetch data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      setError('Category name is required');
      return;
    }

    try {
      await window.electron.api.addCategory(newCategory);
      setNewCategory('');
      await fetchData();
    } catch (err) {
      setError('Failed to add category');
      console.error(err);
    }
  };

  const handleSaveProduct = async () => {
    if (!formData.name || !formData.price || !formData.category_id) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      if (editingId) {
        await window.electron.api.updateProduct(editingId, formData);
      } else {
        await window.electron.api.addProduct(formData);
      }

      setFormData({
        name: '',
        price: 0,
        cost: 0,
        sku: '',
        category_id: '',
        quantity: 0,
      });
      setEditingId(null);
      setShowForm(false);
      setError('');
      await fetchData();
    } catch (err) {
      setError('Failed to save product');
      console.error(err);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await window.electron.api.deleteProduct(id);
      await fetchData();
    } catch (err) {
      setError('Failed to delete product');
      console.error(err);
    }
  };

  const handleEditProduct = (product: Product) => {
    setFormData({
      name: product.name,
      price: product.price,
      cost: product.cost || 0,
      sku: product.sku || '',
      category_id: product.category_id,
      quantity: 0,
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku?.includes(searchTerm)
  );

  if (loading) {
    return <div className="text-center py-12">Loading products...</div>;
  }

  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.name || 'N/A';
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Add Category Section */}
      <div className="card">
        <h3 className="text-lg font-bold text-gray-800 mb-3">Add New Category</h3>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Category name..."
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="input-field flex-1"
          />
          <button onClick={handleAddCategory} className="btn btn-primary">
            Add Category
          </button>
        </div>
      </div>

      {/* Products Section */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">Products</h3>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingId(null);
              setFormData({
                name: '',
                price: 0,
                cost: 0,
                sku: '',
                category_id: '',
                quantity: 0,
              });
            }}
            className="btn btn-primary"
          >
            {showForm ? 'Cancel' : '+ Add Product'}
          </button>
        </div>

        {showForm && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-semibold mb-4">
              {editingId ? 'Edit Product' : 'New Product'}
            </h4>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="label">Product Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  placeholder="Enter product name"
                />
              </div>
              <div>
                <label className="label">SKU</label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className="input-field"
                  placeholder="SKU"
                />
              </div>
              <div>
                <label className="label">Category *</label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="input-field"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Selling Price *</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  className="input-field"
                  placeholder="0"
                  min="0"
                />
              </div>
              <div>
                <label className="label">Cost Price</label>
                <input
                  type="number"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
                  className="input-field"
                  placeholder="0"
                  min="0"
                />
              </div>
              <div>
                <label className="label">Initial Quantity</label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                  className="input-field"
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSaveProduct}
                className="btn btn-success flex-1"
              >
                {editingId ? 'Update' : 'Save'} Product
              </button>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search products by name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field w-full"
          />
        </div>

        {/* Products Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Product Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">SKU</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Category</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Price</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Cost</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Margin</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => {
                const margin = product.cost ? ((product.price - product.cost) / product.price * 100).toFixed(1) : '-';
                return (
                  <tr key={product.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{product.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{product.sku || '-'}</td>
                    <td className="px-4 py-3 text-sm">{getCategoryName(product.category_id)}</td>
                    <td className="px-4 py-3 text-sm font-semibold">
                      Rp{product.price.toLocaleString('id-ID')}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      Rp{product.cost?.toLocaleString('id-ID') || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-green-600 font-semibold">{margin}%</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="text-blue-600 hover:text-blue-800 mr-3"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
