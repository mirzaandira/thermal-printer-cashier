# Thermal Printer Cashier - POS System

A professional desktop Point-of-Sale (POS) application built with Electron, React, TypeScript, and SQLite for managing sales with 58mm thermal printer integration.

## Features

- **Point of Sale (POS)**: Fast checkout with shopping cart, discounts, and multiple payment methods
- **Product Management**: Add, edit, and delete products with categories and pricing
- **Inventory Management**: Track stock levels with low-stock alerts and reordering
- **Receipt Printing**: ESC/POS formatted receipts for 58mm thermal printers
- **Sales Reports**: Daily and period-based sales analysis with transaction history
- **User Authentication**: PIN-based cashier login with role management
- **Offline First**: Fully functional without internet connection with local SQLite database
- **Multi-User**: Support for multiple cashiers with individual tracking

## Tech Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS + React Router
- **Desktop**: Electron 27
- **Backend**: Node.js with Express-like IPC
- **Database**: SQLite3 with local file storage
- **Build Tools**: Vite, TypeScript, PostCSS

## Installation & Setup

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm

### 1. Install Dependencies

```bash
pnpm install
```

Or with npm:
```bash
npm install
```

### 2. Development Mode

Run both React dev server and Electron in development mode:

```bash
pnpm dev
```

Or:
```bash
npm run dev
```

This will:
- Start Vite dev server on http://localhost:5173
- Launch Electron app which connects to the dev server
- Hot reload on file changes

### 3. Build for Production

Build React and Electron for production:

```bash
pnpm build
```

This creates:
- React build in `dist/renderer`
- Electron app ready for packaging

### 4. Package Application

Create an installer:

```bash
pnpm dist
```

This uses electron-builder to create platform-specific installers.

## Project Structure

```
├── src/
│   ├── main.ts                 # Electron main process
│   ├── preload.ts              # Context bridge for IPC
│   ├── database/
│   │   ├── db.ts              # SQLite database setup & queries
│   │   ├── types.ts           # TypeScript interfaces
│   │   └── seed.ts            # Database initialization with sample data
│   ├── ipc/
│   │   ├── databaseHandlers.ts # IPC handlers for DB operations
│   │   └── printerHandlers.ts  # IPC handlers for printer operations
│   └── renderer/
│       ├── App.tsx            # Main app component with routing
│       ├── App.css            # Global styles
│       ├── main.tsx           # React entry point
│       ├── layouts/
│       │   └── Layout.tsx      # Main layout with sidebar navigation
│       └── pages/
│           ├── LoginPage.tsx           # PIN-based login
│           ├── DashboardPage.tsx       # Sales overview & stats
│           ├── POSPage.tsx            # Point of sale interface
│           ├── ProductsPage.tsx       # Product management
│           ├── InventoryPage.tsx      # Inventory tracking
│           └── SalesReportPage.tsx    # Sales analytics
├── index.html                 # HTML entry point
├── vite.config.ts            # Vite configuration
├── tsconfig.json             # TypeScript config
├── tailwind.config.js        # Tailwind CSS config
├── postcss.config.js         # PostCSS config
└── package.json              # Dependencies & scripts
```

## Database Schema

The application uses SQLite with 6 main tables:

- **categories**: Product categories
- **products**: Product information with pricing
- **inventory**: Stock levels and reorder points
- **transactions**: Sale records
- **transaction_items**: Line items for each transaction
- **users**: Cashier accounts with PIN authentication

Database location: `~/.config/Thermal Printer Cashier/cashier.db`

## Default Login Credentials

For testing, the app is seeded with sample data:

- **Admin PIN**: 1234
- **Cashier 1 PIN**: 5678
- **Cashier 2 PIN**: 9012

Default products include:
- Beverages (Iced Coffee, Iced Tea)
- Food (Burger, Chicken Sandwich)
- Snacks (Fries)
- Desserts (Cheesecake)

## Usage Guide

### Point of Sale (POS)

1. Click "Point of Sale" from the dashboard
2. Search and click products to add to cart
3. Adjust quantities and apply discounts if needed
4. Select payment method (Cash, Card, Bank Transfer, E-Wallet)
5. Click "Checkout" and confirm
6. Receipt automatically prints to configured thermal printer

### Product Management

1. Go to Products section
2. Add new categories if needed
3. Click "Add Product" to create new items
4. Edit or delete existing products
5. Track cost and profit margins

### Inventory Management

1. Navigate to Inventory section
2. View current stock levels
3. Set reorder levels for automatic low-stock alerts
4. Click "Restock" to quickly increase quantities
5. Monitor inventory value

### Sales Reports

1. Select date range for the report
2. View daily sales summaries
3. Analyze average transaction values
4. Export data to CSV for further analysis
5. Track sales trends over time

## Receipt Printing

### Supported Printers

- 58mm thermal receipt printers (most common for POS)
- ESC/POS protocol compatible devices
- Popular brands: Epson, Star, IMPRINT, Thermal printers

### Receipt Format

Receipts include:
- Store name and transaction date
- Cashier information
- Itemized product list with quantities
- Subtotal, discounts, tax, and total
- Payment method
- Transaction ID (for reference)

### Configuration

To connect to your thermal printer:

1. Install printer drivers for your system
2. Ensure printer is connected (USB or Network)
3. Print receipts through the POS system
4. Adjust ESC/POS settings in `src/ipc/printerHandlers.ts` if needed

## Development Notes

### Adding New Features

1. Database changes: Update `src/database/db.ts` schema
2. Backend logic: Add IPC handlers in `src/ipc/`
3. Frontend: Create new pages in `src/renderer/pages/`
4. Update preload API in `src/preload.ts`

### Building for Different Platforms

The project uses electron-builder for cross-platform builds:

```bash
# macOS
pnpm dist -- --mac

# Windows
pnpm dist -- --win

# Linux
pnpm dist -- --linux
```

## Troubleshooting

### Database Issues

If database doesn't initialize:
1. Delete `~/.config/Thermal Printer Cashier/` directory
2. Restart the application
3. Database will be recreated with sample data

### Printer Not Found

1. Check printer drivers are installed
2. Ensure printer is connected
3. Test printer separately from OS settings
4. Check printer cable/network connection

### App Won't Start

1. Clear node_modules: `rm -rf node_modules && pnpm install`
2. Clear Electron cache: `pnpm dev` (clean install)
3. Check Node.js version: `node --version` (18+ required)

## Security Considerations

- PINs are stored in plain text in SQLite (for demo purposes)
- For production: Implement password hashing with bcrypt
- Add user permission levels and audit logs
- Implement secure session management
- Consider database encryption

## Future Enhancements

- Multi-location support with cloud sync
- Advanced analytics and business intelligence
- Customer loyalty programs
- Receipt customization and branding
- Integration with payment gateways
- Barcode scanning support
- Table/order management for restaurants
- Receipt reprinting and transaction history

## License

This project is provided as-is for educational and commercial use.

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review the console logs when running `pnpm dev`
3. Check Electron/React documentation
4. Verify database connectivity in DevTools

---

Built with Electron + React + TypeScript for reliable offline-first POS operations.
