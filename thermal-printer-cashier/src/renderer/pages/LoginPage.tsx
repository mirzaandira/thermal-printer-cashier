import React, { useState } from 'react';

interface LoginPageProps {
  onLogin: (user: any) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!pin) {
      setError('Please enter PIN');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const user = await window.electron.api.verifyPin(pin);
      
      if (user) {
        setPin('');
        onLogin(user);
      } else {
        setError('Invalid PIN');
        setPin('');
      }
    } catch (err) {
      setError('Error verifying PIN');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  const handlePinClick = (num: string) => {
    setPin(pin + num);
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-600 to-blue-800">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-96">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Thermal Cashier</h1>
          <p className="text-gray-600">Enter PIN to Continue</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="mb-6">
          <div className="bg-gray-100 rounded-lg p-4 text-center min-h-16 flex items-center justify-center">
            <span className="text-4xl tracking-widest">
              {'•'.repeat(pin.length)}{pin.length === 0 ? '' : ''}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handlePinClick(num.toString())}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-3 rounded-lg text-2xl transition-colors disabled:opacity-50"
            >
              {num}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <button
            onClick={() => handlePinClick('0')}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-3 rounded-lg text-2xl col-span-2 transition-colors disabled:opacity-50"
          >
            0
          </button>
          <button
            onClick={handleBackspace}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-3 rounded-lg transition-colors disabled:opacity-50"
          >
            ← Back
          </button>
        </div>

        <button
          onClick={handleLogin}
          disabled={loading || !pin}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? 'Verifying...' : 'Login'}
        </button>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg text-center text-sm text-gray-600">
          <p className="font-semibold mb-2">Demo PIN:</p>
          <p>Use PIN: <span className="font-mono bg-gray-200 px-2 py-1 rounded">1234</span> (for testing)</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
