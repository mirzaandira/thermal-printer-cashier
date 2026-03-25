# Quick Start Guide - Thermal Printer Cashier POS

Get your POS system running in minutes!

## 1. Install & Run (5 minutes)

```bash
# Install dependencies
pnpm install

# Start development mode
pnpm dev
```

The app will automatically launch after the React dev server starts.

## 2. Login

Use PIN: **1234** (Admin User)

Or try:
- **5678** (Cashier 1)
- **9012** (Cashier 2)

## 3. Add Sample Data (Already Done!)

The app comes pre-loaded with:
- 6 sample products (Coffee, Tea, Burger, etc.)
- 4 product categories
- 100 units per product
- Ready to sell!

## 4. Make Your First Sale

1. Click **"Point of Sale"** from dashboard
2. Click on any product to add it to cart (e.g., "Iced Coffee")
3. Adjust quantity with +/- buttons
4. Click **"Checkout"**
5. Select payment method
6. Click **"Complete Sale"**
7. Receipt prints to your thermal printer

## 5. Try Other Features

### Dashboard
- See today's sales summary
- Quick action buttons
- Real-time statistics

### Products
- Add new products with categories
- Set selling and cost prices
- Track profit margins
- Edit or delete products

### Inventory
- View current stock levels
- Low stock alerts
- Quick restock function
- Monitor inventory value

### Reports
- Daily sales summaries
- Transaction history
- Export to CSV
- Custom date ranges

## Common Tasks

### Add a New Product

1. Go to **Products**
2. Click **"+ Add Product"**
3. Fill in:
   - Product Name (required)
   - Category (required)
   - Selling Price (required)
   - Cost Price (optional)
   - SKU (optional)
   - Initial Quantity
4. Click **"Save Product"**

### Check Inventory

1. Go to **Inventory**
2. View current stock for all products
3. See items with **Low Stock** warning
4. Click **"Restock"** to add more inventory

### View Daily Sales

1. Go to **"Sales Reports"**
2. Select date range
3. View summary or transaction details
4. Export as CSV if needed

### Change User

1. Click **"Logout"** button (bottom of sidebar)
2. Enter different PIN
3. App switches to new user

## Troubleshooting

### App won't start?
```bash
# Clear and reinstall
rm -rf node_modules
pnpm install
pnpm dev
```

### Lost database?
```bash
# Delete database to recreate with sample data
rm ~/.config/Thermal\ Printer\ Cashier/cashier.db
# Restart app - database will be recreated
```

### Printer not printing?
- Check printer is connected and powered on
- Ensure printer drivers are installed
- Test printer separately (print from OS settings)
- For troubleshooting, check browser console in dev tools

## For Production

### Build Installer
```bash
pnpm build     # Build React + Electron
pnpm dist      # Create installer
```

### Deploy
- Find installers in `dist` folder
- Windows: `.exe` file (NSIS installer)
- macOS: `.dmg` file
- Linux: `.AppImage` or `.deb`

## Architecture Overview

```
Frontend (React)
    ↓
IPC Bridge (Preload)
    ↓
Main Process (Electron)
    ↓
SQLite Database (Local)
    ↓
Thermal Printer
```

Everything runs locally - no internet required!

## Next Steps

1. Customize store name in receipts (`src/ipc/printerHandlers.ts`)
2. Add your own products and categories
3. Train cashiers on using the system
4. Connect your thermal printer
5. Build and deploy installer

## File Structure Quick Reference

- `src/main.ts` - Electron main process
- `src/renderer/App.tsx` - React app root
- `src/database/db.ts` - Database setup
- `src/database/seed.ts` - Sample data
- `src/renderer/pages/` - All pages (POS, Products, Reports, etc.)

## Tips & Tricks

- **Quick product search**: Type product name in POS screen
- **Bulk discounts**: Use discount % on cart page
- **Fast restock**: Click "Restock" button in inventory
- **Print receipt again**: View transaction in Reports, print from history
- **Backup data**: Database file in `~/.config/Thermal Printer Cashier/`

---

For detailed documentation, see [README.md](./README.md)

Happy selling!
