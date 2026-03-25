import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface Product {
  id: string;
  name: string;
  price: number;
  sku?: string;
  image_url?: string;
}

interface CartItem {
  id: string;
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  discount_percent?: number;
  total: number;
}

interface POSPageProps {
  user: { id: string; name: string; role: string };
}

const POSPage: React.FC<POSPageProps> = ({ user }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await window.electron.api.getProducts();
      setProducts(data);
    } catch (err) {
      setError('Failed to fetch products');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.product_id === product.id);

    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.product_id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                total: (item.quantity + 1) * item.price,
              }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          id: uuidv4(),
          product_id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          total: product.price,
        },
      ]);
    }
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(cart.filter((item) => item.id !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }

    setCart(
      cart.map((item) =>
        item.id === cartItemId
          ? {
              ...item,
              quantity,
              total: quantity * item.price * (1 - (item.discount_percent || 0) / 100),
            }
          : item
      )
    );
  };

  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const discountAmount = subtotal * (discountPercent / 100);
  const total = subtotal - discountAmount;
  const tax = total * 0.1; // 10% tax
  const finalTotal = total + tax;

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku?.includes(searchTerm)
  );

  const handleCheckout = async () => {
    if (cart.length === 0) {
      setError('Cart is empty');
      return;
    }

    try {
      const transactionId = await window.electron.api.saveTransaction({
        cashier_id: user.id,
        subtotal,
        tax,
        discount_amount: discountAmount,
        discount_percent: discountPercent,
        total: finalTotal,
        payment_method: paymentMethod,
        status: 'completed',
        items: cart.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.price,
          discount_amount: 0,
          total: item.total,
        })),
      });

      // Print receipt
      await window.electron.api.printReceipt({
        transaction_id: transactionId,
        storeName: 'Your Store Name',
        cashierName: user.name,
        items: cart,
        subtotal,
        discount_amount: discountAmount,
        tax,
        total: finalTotal,
        payment_method: paymentMethod,
      });

      // Clear cart
      setCart([]);
      setDiscountPercent(0);
      setShowPaymentModal(false);
      setError('');

      alert(`Transaction completed! ID: ${transactionId}`);
    } catch (err) {
      setError('Failed to process transaction');
      console.error(err);
    }
  };

  return (
    <div className="flex gap-6 h-full">
      {/* Product Section */}
      <div className="flex-1 flex flex-col">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search products by name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field w-full"
          />
        </div>

        <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <button
              key={product.id}
              onClick={() => addToCart(product)}
              className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-lg transition-all text-left"
            >
              <div className="text-2xl mb-2">📦</div>
              <h3 className="font-semibold text-sm text-gray-800 line-clamp-2">
                {product.name}
              </h3>
              <p className="text-xs text-gray-600 mb-2">{product.sku}</p>
              <p className="text-lg font-bold text-blue-600">
                Rp{product.price.toLocaleString('id-ID')}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Cart Section */}
      <div className="w-96 bg-white rounded-lg shadow-lg p-4 flex flex-col">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Shopping Cart</h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-2">
          {cart.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Cart is empty</p>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-semibold text-sm">{item.name}</span>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    ✕
                  </button>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-2 py-1 rounded text-sm"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                    className="w-12 px-1 py-1 border border-gray-300 rounded text-center text-sm"
                  />
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-2 py-1 rounded text-sm"
                  >
                    +
                  </button>
                  <span className="text-sm text-gray-600 ml-auto">
                    Rp{item.total.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Discount */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <label className="text-sm font-semibold text-gray-700 block mb-2">
            Discount (%)
          </label>
          <input
            type="number"
            value={discountPercent}
            onChange={(e) => setDiscountPercent(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
            className="input-field w-full"
            min="0"
            max="100"
          />
        </div>

        {/* Totals */}
        <div className="border-t-2 border-gray-200 pt-4 space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-semibold">Rp{subtotal.toLocaleString('id-ID')}</span>
          </div>
          {discountPercent > 0 && (
            <div className="flex justify-between text-sm text-orange-600">
              <span>Discount ({discountPercent}%):</span>
              <span className="font-semibold">-Rp{discountAmount.toLocaleString('id-ID')}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tax (10%):</span>
            <span className="font-semibold">Rp{tax.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-blue-600 pt-2 border-t border-gray-200">
            <span>TOTAL:</span>
            <span>Rp{finalTotal.toLocaleString('id-ID')}</span>
          </div>
        </div>

        {/* Payment Method */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <label className="text-sm font-semibold text-gray-700 block mb-2">
            Payment Method
          </label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="input-field w-full"
          >
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="transfer">Bank Transfer</option>
            <option value="ewallet">E-Wallet</option>
          </select>
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setCart([])}
            className="flex-1 btn btn-secondary"
          >
            Clear
          </button>
          <button
            onClick={() => setShowPaymentModal(true)}
            disabled={cart.length === 0}
            className="flex-1 btn btn-primary disabled:opacity-50"
          >
            Checkout
          </button>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Confirm Payment</h2>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>Rp{subtotal.toLocaleString('id-ID')}</span>
              </div>
              {discountPercent > 0 && (
                <div className="flex justify-between text-orange-600">
                  <span>Discount:</span>
                  <span>-Rp{discountAmount.toLocaleString('id-ID')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Tax (10%):</span>
                <span>Rp{tax.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-3">
                <span>TOTAL:</span>
                <span>Rp{finalTotal.toLocaleString('id-ID')}</span>
              </div>
              <div>
                <span className="text-sm text-gray-600">Payment Method: </span>
                <span className="font-semibold">{paymentMethod.toUpperCase()}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleCheckout}
                className="flex-1 btn btn-success"
              >
                Complete Sale
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POSPage;
