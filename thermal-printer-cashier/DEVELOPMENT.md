# Development Guide

This guide helps developers extend and customize the Thermal Printer Cashier application.

## Setting Up Development Environment

### Prerequisites
- Node.js 18+
- Git
- A code editor (VS Code recommended)
- SQLite viewer (optional: DB Browser for SQLite)

### Initial Setup
```bash
git clone <repository>
cd thermal-printer-cashier
pnpm install
pnpm dev
```

## Project Structure & Architecture

### Main Process (Electron)
**Location**: `src/main.ts`

The main process handles:
- Application window creation
- Database initialization
- IPC handler registration
- Printer management

Key responsibilities:
1. Initialize SQLite database on app startup
2. Register all IPC handlers
3. Manage window lifecycle
4. Handle app events (ready, activate, quit)

### Renderer Process (React)
**Location**: `src/renderer/`

The renderer process handles:
1. User interface rendering
2. User interactions
3. IPC calls to main process
4. Local state management

### IPC Communication Layer
**Locations**: `src/ipc/`

Two main handler files:
1. `databaseHandlers.ts` - Database operations
2. `printerHandlers.ts` - Printer operations

Pattern:
```typescript
// Main process
ipcMain.handle('channel:name', async (event, data) => {
  // Do something
  return result;
});

// Renderer process (preload)
api.methodName = () => ipcRenderer.invoke('channel:name', data);

// React component
const result = await window.electron.api.methodName(data);
```

## Adding New Features

### Scenario 1: Add New Database Field to Products

**Step 1**: Modify database schema in `src/database/db.ts`
```typescript
db.run(`
  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category_id TEXT NOT NULL,
    price REAL NOT NULL,
    cost REAL,
    sku TEXT UNIQUE,
    image_url TEXT,
    supplier_id TEXT,  // NEW FIELD
    active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id)  // NEW
  )
`);
```

**Step 2**: Add TypeScript interface in `src/database/types.ts`
```typescript
export interface Product {
  id: string;
  name: string;
  category_id: string;
  price: number;
  cost?: number;
  sku?: string;
  image_url?: string;
  supplier_id?: string;  // NEW
  active: boolean;
  created_at: string;
  updated_at: string;
}
```

**Step 3**: Add IPC handlers in `src/ipc/databaseHandlers.ts`
```typescript
ipcMain.handle('db:updateProductSupplier', async (_, productId: string, supplierId: string) => {
  await runQuery(
    'UPDATE products SET supplier_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [supplierId, productId]
  );
});
```

**Step 4**: Expose API in `src/preload.ts`
```typescript
export const api = {
  // ... existing methods
  updateProductSupplier: (productId: string, supplierId: string) =>
    ipcRenderer.invoke('db:updateProductSupplier', productId, supplierId),
};
```

**Step 5**: Update React components
```typescript
import { api } from '../preload';

await window.electron.api.updateProductSupplier(productId, supplierId);
```

### Scenario 2: Add New Page/Route

**Step 1**: Create new page component in `src/renderer/pages/`
```typescript
// src/renderer/pages/SuppliersPage.tsx
import React, { useState, useEffect } from 'react';

const SuppliersPage: React.FC = () => {
  const [suppliers, setSuppliers] = useState([]);
  
  useEffect(() => {
    fetchSuppliers();
  }, []);
  
  const fetchSuppliers = async () => {
    const data = await window.electron.api.getSuppliers();
    setSuppliers(data);
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Suppliers</h1>
      {/* Page content */}
    </div>
  );
};

export default SuppliersPage;
```

**Step 2**: Add route in `src/renderer/App.tsx`
```typescript
import SuppliersPage from './pages/SuppliersPage';

// Inside Routes component
<Route path="/suppliers" element={<SuppliersPage />} />
```

**Step 3**: Add menu item in `src/renderer/layouts/Layout.tsx`
```typescript
const menuItems = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/pos', label: 'Point of Sale', icon: '🛒' },
  { path: '/products', label: 'Products', icon: '📦' },
  { path: '/suppliers', label: 'Suppliers', icon: '🏢' }, // NEW
  // ...
];
```

### Scenario 3: Add New Report Type

**Step 1**: Add IPC handler in `src/ipc/databaseHandlers.ts`
```typescript
ipcMain.handle('db:getProductSalesReport', async (_, startDate: string, endDate: string) => {
  return getAll(
    `SELECT 
      p.id, p.name, p.sku,
      SUM(ti.quantity) as total_quantity,
      SUM(ti.total) as total_revenue,
      AVG(ti.unit_price) as avg_price
    FROM products p
    LEFT JOIN transaction_items ti ON p.id = ti.product_id
    LEFT JOIN transactions t ON ti.transaction_id = t.id
    WHERE date(t.created_at) BETWEEN ? AND ? AND t.status = 'completed'
    GROUP BY p.id
    ORDER BY total_revenue DESC`,
    [startDate, endDate]
  );
});
```

**Step 2**: Add to preload API
```typescript
getProductSalesReport: (startDate: string, endDate: string) =>
  ipcRenderer.invoke('db:getProductSalesReport', startDate, endDate),
```

**Step 3**: Create report component and integrate into SalesReportPage

## Common Patterns

### Form Submission with Validation
```typescript
const [formData, setFormData] = useState({ name: '', email: '' });
const [error, setError] = useState('');

const handleSubmit = async () => {
  // Validation
  if (!formData.name.trim()) {
    setError('Name is required');
    return;
  }
  
  try {
    setError('');
    const result = await window.electron.api.addItem(formData);
    // Success handling
    setFormData({ name: '', email: '' });
  } catch (err) {
    setError('Failed to save item');
  }
};
```

### Async Data Loading
```typescript
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState('');

useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await window.electron.api.getData();
      setData(result);
    } catch (err) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };
  
  fetchData();
}, []);

if (loading) return <div>Loading...</div>;
if (error) return <div className="text-red-600">{error}</div>;
```

### Database Query with Parameters
```typescript
export const getOne = (sql: string, params: any[] = []): Promise<any> => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

// Usage
const product = await getOne('SELECT * FROM products WHERE id = ?', [productId]);
```

## Debugging

### Enable Debug Logging
In development, add console logs strategically:

**Main Process**
```typescript
// src/ipc/databaseHandlers.ts
ipcMain.handle('db:getProducts', async () => {
  console.log('[DB] Fetching products...');
  const products = await getAll('SELECT * FROM products WHERE active = 1');
  console.log('[DB] Found', products.length, 'products');
  return products;
});
```

**Renderer Process**
```typescript
// In React components
console.log('[v0] Component mounted');
console.log('[v0] Data received:', data);
console.log('[v0] Error:', error);
```

### View Database Directly
```bash
# Open database file with SQLite browser
# Location: ~/.config/Thermal Printer Cashier/cashier.db

# Or from terminal
sqlite3 ~/.config/Thermal\ Printer\ Cashier/cashier.db
> SELECT * FROM products;
```

### DevTools
- Press `Ctrl+Shift+I` (Windows/Linux) or `Cmd+Option+I` (macOS) in dev mode
- Check Console tab for errors
- Inspect network calls (IPC)
- View React component hierarchy

## Testing

### Manual Testing Workflow
1. Start app: `pnpm dev`
2. Perform user actions
3. Verify data in database: `SELECT * FROM products;`
4. Check console for errors
5. Test edge cases (empty lists, large numbers, special characters)

### Test Categories

**Functional Testing**
- Add/edit/delete operations
- Search and filter
- Report generation
- Calculations (tax, discount, total)

**Data Validation**
- Required field validation
- Number range validation
- Duplicate checking
- Data type validation

**Integration Testing**
- Database operations complete successfully
- UI updates reflect database changes
- IPC communication works both directions
- Printer formatting is correct

**Edge Cases**
- Empty database
- Very large datasets
- Special characters in product names
- Extreme prices/quantities
- Multiple rapid transactions

## Performance Optimization

### Database Query Optimization
```typescript
// GOOD: Use specific columns
SELECT id, name, price FROM products WHERE active = 1;

// BAD: Select all columns
SELECT * FROM products WHERE active = 1;

// GOOD: Use indexes
CREATE INDEX idx_products_category ON products(category_id);

// Use WHERE clauses effectively
SELECT * FROM products WHERE active = 1 AND price > 0;
```

### React Performance
```typescript
// Use memo for expensive components
import React, { memo } from 'react';

const ProductCard = memo(({ product, onSelect }) => {
  return <div onClick={() => onSelect(product)}>...</div>;
});

// Use useCallback to prevent unnecessary re-renders
const handleSelect = useCallback((product) => {
  // Handle selection
}, []);
```

### Caching
```typescript
// Cache product list in local storage
const cachedProducts = localStorage.getItem('products');
if (cachedProducts) {
  setProducts(JSON.parse(cachedProducts));
} else {
  const products = await window.electron.api.getProducts();
  localStorage.setItem('products', JSON.stringify(products));
  setProducts(products);
}
```

## Build & Distribution

### Building
```bash
# Development build
pnpm dev

# Production build
pnpm build

# Create installer
pnpm dist

# Build for specific platform
pnpm dist -- --win   # Windows
pnpm dist -- --mac   # macOS
pnpm dist -- --linux # Linux
```

### Publishing
1. Create GitHub release
2. Upload installers to release
3. Update version in package.json
4. Tag release with version number

## Troubleshooting Development Issues

### Issue: Module not found errors
**Solution**: 
```bash
rm -rf node_modules
pnpm install
pnpm dev
```

### Issue: TypeScript errors
**Solution**: Check `tsconfig.json` and ensure all imports use correct paths with `@/` alias

### Issue: Database errors
**Solution**: 
```bash
# Delete database to reset
rm ~/.config/Thermal\ Printer\ Cashier/cashier.db
# Restart app
```

### Issue: IPC communication failing
**Solution**: 
1. Check handler is registered in main process
2. Verify API is exposed in preload.ts
3. Check console for error messages
4. Ensure arguments match expected types

## Code Style & Best Practices

### TypeScript
- Always use explicit types
- Avoid `any` type
- Use interfaces for objects
- Use enums for constants

### React
- Use functional components with hooks
- Keep components small and focused
- Extract reusable logic to custom hooks
- Use proper key props in lists

### File Organization
```
Feature/
├── components/      # Reusable components
├── hooks/          # Custom hooks
├── pages/          # Page components
├── types.ts        # TypeScript interfaces
└── utils.ts        # Helper functions
```

### Naming Conventions
- Components: PascalCase (e.g., `ProductCard`)
- Functions: camelCase (e.g., `fetchProducts`)
- Constants: UPPER_SNAKE_CASE (e.g., `MAX_PRODUCTS`)
- Files: lowercase with hyphens (e.g., `product-card.tsx`)

## Resources

- [Electron Documentation](https://www.electronjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

## Getting Help

1. Check existing code for similar implementations
2. Review error messages in console
3. Search GitHub issues
4. Check Electron/React documentation
5. Test in isolation (create minimal example)

---

Happy coding!
